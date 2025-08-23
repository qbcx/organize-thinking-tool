const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get the base URL for production or development
const BASE_URL = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.APP_URL || 'http://localhost:3000';

// Security check for OAuth credentials
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ Google OAuth credentials not found in environment variables!');
    console.error('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: [BASE_URL, 'http://localhost:3000', 'https://localhost:3000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT middleware to extract user from token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return next();
    }
    
    jwt.verify(token, process.env.SESSION_SECRET || 'your-super-secret-session-key', (err, user) => {
        if (err) {
            console.log('JWT verification failed:', err.message);
            return next();
        }
        req.user = user;
        next();
    });
};

// Apply JWT middleware
app.use(authenticateToken);

// Google OAuth client (use environment variables only)
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${BASE_URL}/auth/google/callback`
);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Routes
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '..', 'frontend') });
});

app.get('/dashboard', (req, res) => {
    console.log('Dashboard route accessed');
    res.sendFile('dashboard.html', { root: path.join(__dirname, '..', 'frontend') });
});

// Test route to verify server is working
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', route: '/test' });
});

// Test route to manually set a session (for debugging)
app.get('/test-session', (req, res) => {
    req.session.user = {
        id: 'test-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://via.placeholder.com/60',
        provider: 'test'
    };
    
    req.session.save((err) => {
        if (err) {
            console.error('Test session save error:', err);
            return res.json({ error: 'Session save failed', details: err.message });
        }
        console.log('Test session saved successfully');
        res.json({ 
            message: 'Test session created', 
            sessionId: req.sessionID,
            user: req.session.user 
        });
    });
});

// Favicon route
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content
});

// Google OAuth URL generation
app.post('/api/auth/google', async (req, res) => {
    try {
        // Safe logging - only log non-sensitive info
        if (process.env.NODE_ENV === 'development') {
            console.log('🔐 Google OAuth URL requested');
            console.log('📊 Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
        }
        
        const authUrl = googleClient.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            prompt: 'consent'
        });
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Google OAuth URL generated successfully');
        }
        
        res.json({ auth_url: authUrl });
    } catch (error) {
        console.error('❌ Error generating auth URL:', error.message);
        res.status(500).json({ error: 'Failed to generate auth URL' });
    }
});

// GitHub OAuth URL generation
app.post('/api/auth/github', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔐 GitHub OAuth URL requested');
            console.log('📊 GitHub Client ID:', process.env.GITHUB_CLIENT_ID ? 'Set' : 'Missing');
        }
        
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GITHUB_REDIRECT_URI || `${BASE_URL}/auth/github/callback`)}&scope=user:email`;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ GitHub OAuth URL generated successfully');
        }
        
        res.json({ auth_url: githubAuthUrl });
    } catch (error) {
        console.error('❌ Error generating GitHub auth URL:', error.message);
        res.status(500).json({ error: 'Failed to generate GitHub auth URL' });
    }
});

// Google OAuth callback
app.get('/auth/google/callback', async (req, res) => {
    console.log('Google OAuth callback accessed');
    console.log('Query parameters:', req.query);
    console.log('Session ID before:', req.sessionID);
    
    try {
        const { code } = req.query;
        
        if (!code) {
            console.log('No authorization code received');
            return res.redirect('/?error=No authorization code received');
        }

        // Exchange code for tokens
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Exchanging authorization code for tokens...');
        }
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Tokens received successfully');
        }

        // Get user info
        if (process.env.NODE_ENV === 'development') {
            console.log('👤 Fetching user profile from Google API...');
        }
        const userInfo = await googleClient.request({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo'
        });
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ User profile fetched successfully');
            console.log('📧 User email:', userInfo.data.email);
            console.log('👤 User name:', userInfo.data.name);
        }

        // Create JWT token with user info
        const userData = {
            id: userInfo.data.id,
            email: userInfo.data.email,
            name: userInfo.data.name,
            picture: userInfo.data.picture,
            provider: 'google'
        };

        const token = jwt.sign(userData, process.env.SESSION_SECRET || 'your-super-secret-session-key', { expiresIn: '24h' });

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ JWT token created successfully');
            console.log('👤 User provider:', userData.provider);
        }

        // Redirect with token in URL (for demo purposes - in production, use secure cookies)
        res.redirect(`/?login=success&token=${token}`);
        
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect('/?error=Authentication failed');
    }
});

// GitHub OAuth callback
app.get('/auth/github/callback', async (req, res) => {
    console.log('GitHub OAuth callback accessed');
    console.log('Query parameters:', req.query);
    console.log('Session ID before:', req.sessionID);
    
    try {
        const { code } = req.query;
        
        if (!code) {
            console.log('No authorization code received');
            return res.redirect('/?error=No authorization code received');
        }

        // Exchange code for access token
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Exchanging GitHub authorization code for access token...');
        }
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code
        }, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const { access_token } = tokenResponse.data;

        if (!access_token) {
            if (process.env.NODE_ENV === 'development') {
                console.log('❌ Failed to get GitHub access token');
            }
            return res.redirect('/?error=Failed to get access token');
        }
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ GitHub access token received successfully');
        }

        // Get user info from GitHub
        if (process.env.NODE_ENV === 'development') {
            console.log('👤 Fetching GitHub user profile...');
        }
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${access_token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ GitHub user profile fetched successfully');
            console.log('👤 GitHub username:', userResponse.data.login);
        }

        // Get user email
        if (process.env.NODE_ENV === 'development') {
            console.log('📧 Fetching GitHub user emails...');
        }
        const emailResponse = await axios.get('https://api.github.com/user/emails', {
            headers: {
                'Authorization': `token ${access_token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ GitHub user emails fetched successfully');
        }

        const primaryEmail = emailResponse.data.find(email => email.primary)?.email || userResponse.data.email;

        // Create JWT token with user info
        const userData = {
            id: userResponse.data.id,
            email: primaryEmail,
            name: userResponse.data.name || userResponse.data.login,
            picture: userResponse.data.avatar_url,
            provider: 'github'
        };

        const token = jwt.sign(userData, process.env.SESSION_SECRET || 'your-super-secret-session-key', { expiresIn: '24h' });

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ JWT token created successfully');
            console.log('👤 User provider:', userData.provider);
        }

        // Redirect with token in URL (for demo purposes - in production, use secure cookies)
        res.redirect(`/?login=success&token=${token}`);
        
    } catch (error) {
        console.error('GitHub OAuth callback error:', error);
        res.redirect('/?error=GitHub authentication failed');
    }
});

// Check auth status
app.get('/auth/status', (req, res) => {
    if (req.session.user) {
        res.json({ 
            authenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Logout
app.get('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// Health check for deployment
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Usage tracking endpoint
app.get('/api/usage', (req, res) => {
    res.json({
        message: 'OAuth Usage Information',
        note: 'Check Google Cloud Console for detailed metrics',
        endpoints: {
            google_oauth: '/api/auth/google',
            google_callback: '/auth/google/callback',
            github_oauth: '/api/auth/github',
            github_callback: '/auth/github/callback'
        },
        google_cloud_console: {
            oauth_consent_screen: 'APIs & Services → OAuth consent screen → Usage',
            credentials: 'APIs & Services → Credentials → OAuth 2.0 Client IDs',
            api_dashboard: 'APIs & Services → Dashboard → Google+ API'
        },
        github_monitoring: {
            oauth_app_settings: 'GitHub.com → Settings → Developer settings → OAuth Apps',
            rate_limits: 'Check /api/github-rate-limit endpoint',
            api_documentation: 'https://docs.github.com/en/rest/rate-limit'
        },
        timestamp: new Date().toISOString()
    });
});

// GitHub rate limit checking endpoint
app.get('/api/github-rate-limit', async (req, res) => {
    try {
        console.log('📊 Checking GitHub API rate limits...');
        
        // Make a request to GitHub API to check rate limits
        const response = await axios.get('https://api.github.com/rate_limit', {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Organize-Thinking-Tool'
            }
        });
        
        const rateLimit = response.data;
        console.log('✅ GitHub rate limit info retrieved');
        
        res.json({
            message: 'GitHub API Rate Limit Information',
            rate_limits: {
                core: {
                    limit: rateLimit.resources.core.limit,
                    remaining: rateLimit.resources.core.remaining,
                    reset: new Date(rateLimit.resources.core.reset * 1000).toISOString(),
                    used: rateLimit.resources.core.used
                },
                search: {
                    limit: rateLimit.resources.search.limit,
                    remaining: rateLimit.resources.search.remaining,
                    reset: new Date(rateLimit.resources.search.reset * 1000).toISOString(),
                    used: rateLimit.resources.search.used
                }
            },
            note: 'OAuth token exchange has separate rate limits',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error checking GitHub rate limits:', error.message);
        res.status(500).json({
            error: 'Failed to check GitHub rate limits',
            message: error.message
        });
    }
});

// Simple user list (for development/admin purposes)
app.get('/api/users', (req, res) => {
    // In a real app, you'd want proper authentication for this
    // For now, we'll just return basic info
    res.json({
        message: 'User management endpoint',
        note: 'In production, add proper authentication here',
        current_user: req.session.user || null
    });
});

// Get current user info
app.get('/api/me', (req, res) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('API /me - User authenticated:', !!req.user);
    }
    
    if (req.user) {
        res.json({
            authenticated: true,
            user: req.user
        });
    } else {
        res.status(401).json({
            authenticated: false,
            message: 'Not logged in'
        });
    }
});

// Catch-all route for debugging (but not for root path)
app.get('*', (req, res) => {
    // Don't catch the root path - let it fall through to static files
    if (req.path === '/') {
        return res.sendFile('index.html', { root: path.join(__dirname, '..', 'frontend') });
    }
    
    console.log(`404 - Route not found: ${req.path}`);
    res.status(404).json({ 
        error: 'Route not found', 
        path: req.path,
        message: 'This route is not handled by the server'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 App URL: ${BASE_URL}`);
    console.log(`🔐 OAuth configured for Google and GitHub`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
