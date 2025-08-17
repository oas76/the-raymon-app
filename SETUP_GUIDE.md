# Quick Setup Guide

This guide will help you get the Golf Auth Service running in development mode quickly.

## Prerequisites Check

Make sure you have:
- [ ] Node.js v18+ installed (`node --version`)
- [ ] MongoDB installed and running (`brew services start mongodb-community` on macOS)
- [ ] Git installed

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
# In the project root directory
npm run install-all
```

### 2. Setup Environment Files

Copy the example environment files:

```bash
# Backend environment
cp backend/env.example backend/.env

# Frontend environment  
cp frontend/env.example frontend/.env
```

### 3. Configure OAuth (Optional for basic testing)

For local testing, you can skip OAuth setup initially. The application will work with email/password registration.

If you want OAuth:

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API → Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `backend/.env`

**Facebook OAuth:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create app → Add Facebook Login → Configure redirect URI: `http://localhost:5000/api/auth/facebook/callback`
3. Update `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` in `backend/.env`

### 4. Update JWT Secret

Edit `backend/.env` and change the JWT_SECRET to something secure:

```env
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-super-secret-session-key-here
```

### 5. Start the Application

```bash
# This starts both backend and frontend simultaneously
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Testing the Application

### 1. Test Email Registration

1. Go to http://localhost:3000
2. Click "Register"
3. Fill in the form with:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
   - Golf Handicap: "15.5"
4. Click "Create Account"

### 2. Test Login

1. Go to login page
2. Use the credentials you just created
3. You should be redirected to the dashboard

### 3. Test Profile Management

1. Go to Profile page
2. Update your name and handicap
3. Upload a profile picture
4. Save changes

### 4. Test OAuth (if configured)

1. Click "Continue with Google" or "Continue with Facebook"
2. Complete OAuth flow
3. Should redirect back to the application

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```bash
# Make sure MongoDB is running
brew services start mongodb-community  # macOS
sudo systemctl start mongodb          # Linux
```

**Port Already in Use:**
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change the port in backend/.env
PORT=5001
```

**OAuth Redirect Error:**
- Check that your OAuth redirect URIs match exactly
- For local development, use `http://localhost:5000/api/auth/google/callback`

**CORS Error:**
- Make sure `FRONTEND_URL=http://localhost:3000` is set in backend/.env
- Check that frontend is running on port 3000

### Environment Variable Issues

Make sure your `.env` files are in the correct locations:
- `backend/.env` (NOT `backend/env`)
- `frontend/.env` (NOT `frontend/env`)

The example files are named `env.example` but your actual files should be `.env`

### Database Issues

If you see database connection errors:

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env to your Atlas connection string
```

## Development Commands

```bash
# Install all dependencies
npm run install-all

# Run both frontend and backend
npm run dev

# Run only backend
npm run backend

# Run only frontend  
npm run frontend

# Build frontend for production
npm run build

# Run backend in production mode
npm start
```

## Next Steps

1. **Customize OAuth**: Set up Google and Facebook OAuth for full functionality
2. **Database**: Consider using MongoDB Atlas for cloud database
3. **Deployment**: Deploy to platforms like Heroku, Vercel, or DigitalOcean
4. **Security**: Change all default secrets before production deployment
5. **Features**: Add golf round tracking, statistics, and social features

## Production Deployment Checklist

- [ ] Change all secrets in environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS for OAuth redirect URIs
- [ ] Set up production MongoDB instance
- [ ] Configure CORS for production domain
- [ ] Set up proper error logging
- [ ] Configure file upload limits and storage
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and backups

For detailed information, see the main README.md file.
