const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
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

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Google OAuth client (use environment variables only)
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${BASE_URL}/auth/google/callback`
);

// Serve static files (frontend)
app.use(express.static('./frontend'));

// Routes
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './frontend' });
});

app.get('/dashboard', (req, res) => {
    console.log('Dashboard route accessed');
    res.sendFile('dashboard.html', { root: './frontend' });
});

// Test route to verify server is working
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', route: '/test' });
});

// Favicon route
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content
});

// Google OAuth URL generation
app.post('/api/auth/google', async (req, res) => {
    try {
        const authUrl = googleClient.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            prompt: 'consent'
        });
        
        res.json({ auth_url: authUrl });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).json({ error: 'Failed to generate auth URL' });
    }
});

// GitHub OAuth URL generation
app.post('/api/auth/github', async (req, res) => {
    try {
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GITHUB_REDIRECT_URI || `${BASE_URL}/auth/github/callback`)}&scope=user:email`;
        
        res.json({ auth_url: githubAuthUrl });
    } catch (error) {
        console.error('Error generating GitHub auth URL:', error);
        res.status(500).json({ error: 'Failed to generate GitHub auth URL' });
    }
});

// Google OAuth callback
app.get('/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.redirect('/?error=No authorization code received');
        }

        // Exchange code for tokens
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);

        // Get user info
        const userInfo = await googleClient.request({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo'
        });

        // Store user info in session
        req.session.user = {
            id: userInfo.data.id,
            email: userInfo.data.email,
            name: userInfo.data.name,
            picture: userInfo.data.picture,
            provider: 'google'
        };

        // Redirect to success
        res.redirect('/?login=success');
        
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect('/?error=Authentication failed');
    }
});

// GitHub OAuth callback
app.get('/auth/github/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.redirect('/?error=No authorization code received');
        }

        // Exchange code for access token
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
            return res.redirect('/?error=Failed to get access token');
        }

        // Get user info from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${access_token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        // Get user email
        const emailResponse = await axios.get('https://api.github.com/user/emails', {
            headers: {
                'Authorization': `token ${access_token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const primaryEmail = emailResponse.data.find(email => email.primary)?.email || userResponse.data.email;

        // Store user info in session
        req.session.user = {
            id: userResponse.data.id,
            email: primaryEmail,
            name: userResponse.data.name || userResponse.data.login,
            picture: userResponse.data.avatar_url,
            provider: 'github'
        };

        // Redirect to success
        res.redirect('/?login=success');
        
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
    if (req.session.user) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.status(401).json({
            authenticated: false,
            message: 'Not logged in'
        });
    }
});

// Catch-all route for debugging
app.get('*', (req, res) => {
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
