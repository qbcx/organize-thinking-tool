# 🧠 Organize Thinking Tool

A modern web application to help you organize your thoughts, track project progress, and boost productivity with OAuth authentication.

<!-- OAuth Configuration Updated -->

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 🎨 **Modern UI Design** - Beautiful glass morphism interface
- 📱 **Responsive Design** - Works on all devices
- 🚀 **Fast Performance** - Optimized for speed
- 🔒 **Secure Sessions** - Protected user data

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Authentication**: Google OAuth 2.0
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
   npm run install-all
   ```

3. **Set up environment variables**
   Create `.env` file in `backend/` directory:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   SESSION_SECRET=your_session_secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (your-vercel-url/auth/google/callback)
   - `SESSION_SECRET`

4. **Update Google Cloud Console**
   - Add your Vercel URL to "Authorized JavaScript origins"
   - Add your Vercel callback URL to "Authorized redirect URIs"

### Option 2: Railway

1. **Connect your GitHub repository to Railway**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically**

### Option 3: Render

1. **Connect your GitHub repository to Render**
2. **Set environment variables in Render dashboard**
3. **Deploy automatically**

## 🔧 Google OAuth Setup

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

## 📁 Project Structure

```
organize-thinking-tool/
├── frontend/
│   ├── index.html          # Main application page
│   └── styles.css          # Styling and animations
├── backend/
│   ├── server.js           # Express server and OAuth logic
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
├── package.json           # Root package.json
├── vercel.json           # Vercel deployment config
└── README.md             # This file
```

## 🔒 Security Features

- **OAuth 2.0 Authentication** - Secure third-party login
- **Session Management** - Protected user sessions
- **CORS Configuration** - Controlled cross-origin requests
- **Environment Variables** - Secure credential storage

## 🎨 Design Features

- **Glass Morphism** - Modern translucent design
- **Gradient Backgrounds** - Beautiful color transitions
- **Smooth Animations** - Professional user experience
- **Responsive Layout** - Works on all screen sizes
- **Custom Modals** - Beautiful success/error messages

## 🚀 Next Steps

After deployment, consider adding:

- [ ] **Database Integration** - Store user data and projects
- [ ] **GitHub OAuth** - Additional login option
- [ ] **Project Management** - Create and track projects
- [ ] **Thinking Framework** - Organize thoughts and ideas
- [ ] **Progress Tracking** - Monitor project milestones
- [ ] **Data Export** - Export your organized thoughts

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
2. Verify your Google OAuth configuration
3. Ensure all environment variables are set correctly
4. Check the deployment logs

## 🎯 Learning Goals

This project demonstrates:

- **OAuth 2.0 Implementation** - Secure authentication
- **Modern Web Development** - HTML5, CSS3, JavaScript
- **Node.js Backend** - Express.js server
- **Deployment** - Cloud hosting and configuration
- **Security Best Practices** - Environment variables, CORS
- **UI/UX Design** - Modern, responsive interfaces

---

**Built with ❤️ for learning and productivity**
