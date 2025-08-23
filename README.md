# 🧠 Organize Thinking Tool

A modern web application to help you organize your thoughts, track project progress, and boost productivity with secure OAuth authentication.

<!-- Updated with GitHub OAuth, JWT Security, Dashboard, and Enhanced Features -->

## ✨ Features

- 🔐 **Dual OAuth Authentication** - Secure login with Google & GitHub
- 🛡️ **JWT Security** - HTTP-only cookies for enhanced security
- 📊 **User Dashboard** - View profile and app status
- 🎨 **Modern UI Design** - Beautiful glass morphism interface
- 📱 **Responsive Design** - Works on all devices
- 🚀 **Fast Performance** - Optimized for speed
- 🔒 **Secure Sessions** - Protected user data with JWT tokens
- 📈 **Usage Monitoring** - Track OAuth API usage

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Authentication**: Google OAuth 2.0, GitHub OAuth, JWT
- **Security**: HTTP-only cookies, CORS, environment variables
- **Styling**: Custom CSS with modern design patterns
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd organize-thinking-tool
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   Create `.env` file in `backend/` directory:
   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   
   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
   
   # Security
   SESSION_SECRET=your_super_secret_session_key
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Set environment variables in Vercel dashboard**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (your-vercel-url/auth/google/callback)
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GITHUB_REDIRECT_URI` (your-vercel-url/auth/github/callback)
   - `SESSION_SECRET`
   - `NODE_ENV=production`

3. **Update OAuth configurations**
   - **Google Cloud Console**: Add your Vercel URL to authorized origins and redirects
   - **GitHub OAuth App**: Update callback URL to your Vercel URL

4. **Deploy automatically**
   - Vercel will automatically deploy on every push to main branch

## 🔧 OAuth Setup

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"

4. **Configure OAuth consent screen**
   - Add your app name and description
   - Add your email as developer contact

5. **Set authorized origins and redirects**
   - **Development**: `http://localhost:3000`
   - **Production**: Your deployed URL (e.g., `https://your-app.vercel.app`)

### GitHub OAuth Setup

1. **Go to GitHub Developer Settings**
   - Visit [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"

2. **Configure OAuth App**
   - **Application name**: Your app name
   - **Homepage URL**: Your app URL
   - **Authorization callback URL**: `https://your-app.vercel.app/auth/github/callback`

3. **Get Client ID and Secret**
   - Copy the generated Client ID and Client Secret
   - Add them to your environment variables

## 📁 Project Structure

```
organize-thinking-tool/
├── frontend/
│   ├── index.html          # Main application page with OAuth buttons
│   ├── dashboard.html      # User dashboard and profile
│   └── styles.css          # Styling and animations
├── backend/
│   ├── server.js           # Express server with OAuth and JWT logic
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables (not in git)
├── package.json           # Root package.json
├── vercel.json           # Vercel deployment config
└── README.md             # This file
```

## 🔒 Security Features

- **Dual OAuth 2.0 Authentication** - Secure login with Google & GitHub
- **JWT Token Security** - HTTP-only cookies, no tokens in URLs
- **Session Management** - Protected user sessions with JWT
- **CORS Configuration** - Controlled cross-origin requests
- **Environment Variables** - Secure credential storage
- **Conditional Logging** - No sensitive data in production logs
- **CSRF Protection** - SameSite cookie attributes

## 🎨 Design Features

- **Glass Morphism** - Modern translucent design
- **Gradient Backgrounds** - Beautiful color transitions
- **Smooth Animations** - Professional user experience
- **Responsive Layout** - Works on all screen sizes
- **Custom Modals** - Beautiful success/error messages
- **Interactive Dashboard** - Real-time user stats and profile display
- **Provider Badges** - Visual distinction between Google and GitHub users

## 📊 API Endpoints

### Authentication
- `POST /api/auth/google` - Generate Google OAuth URL
- `POST /api/auth/github` - Generate GitHub OAuth URL
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/github/callback` - GitHub OAuth callback

### User Management
- `GET /api/me` - Get current user information
- `GET /dashboard` - User dashboard page

### System Information
- `GET /api/health` - System health check
- `GET /api/usage` - OAuth usage information
- `GET /api/github-rate-limit` - GitHub API rate limits

## 🚀 Next Steps

After deployment, consider adding:

- [ ] **Database Integration** - Store user data and projects
- [ ] **Logout Functionality** - Secure user logout
- [ ] **Project Management** - Create and track projects
- [ ] **Thinking Framework** - Organize thoughts and ideas
- [ ] **Progress Tracking** - Monitor project milestones
- [ ] **Data Export** - Export your organized thoughts
- [ ] **User Settings** - Customize dashboard and preferences
- [ ] **Activity Logging** - Track user actions and sessions

## 🔍 Monitoring & Debugging

### OAuth Usage Tracking
- **Google Cloud Console**: Check OAuth consent screen usage
- **GitHub OAuth App**: Monitor in GitHub Developer Settings
- **Vercel Logs**: View function logs for debugging

### Security Monitoring
- **JWT Token Expiration**: 24-hour automatic expiration
- **Cookie Security**: HTTP-only, secure, SameSite attributes
- **Environment-based Logging**: Development vs production logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify your OAuth configurations (Google & GitHub)
3. Ensure all environment variables are set correctly
4. Check the Vercel function logs
5. Test with both OAuth providers

## 🎯 Learning Goals

This project demonstrates:

- **OAuth 2.0 Implementation** - Secure authentication with multiple providers
- **JWT Security** - Token-based authentication with HTTP-only cookies
- **Modern Web Development** - HTML5, CSS3, JavaScript
- **Node.js Backend** - Express.js server with middleware
- **Deployment** - Cloud hosting and configuration
- **Security Best Practices** - Environment variables, CORS, secure cookies
- **UI/UX Design** - Modern, responsive interfaces
- **API Design** - RESTful endpoints and error handling

---

**Built with ❤️ for learning and productivity**
