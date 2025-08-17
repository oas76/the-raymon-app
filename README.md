# The Raymon App

**🌐 GitHub Repository**: https://github.com/oas76/the-raymon-app

A comprehensive authentication and profile management service for golfers, featuring OAuth integration with Google, Facebook, and Vipps (planned), along with secure user profile management.

## Features

- **Multi-Provider Authentication**: Google, Facebook OAuth, and Vipps (planned)
- **User Profile Management**: Name, golf handicap (-10.0 to 36.0), and profile image
- **Secure Authentication**: JWT-based authentication with secure session management
- **Image Upload**: Profile picture upload with file validation
- **CRUD Operations**: Complete user profile management (Create, Read, Update, Delete)
- **Modern UI**: React frontend with Material-UI components
- **Input Validation**: Comprehensive validation for golf handicap range and other fields

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Passport.js** for OAuth authentication
- **JWT** for token-based authentication
- **Multer** for file uploads
- **Express Validator** for input validation
- **bcryptjs** for password hashing

### Frontend
- **React** with React Router
- **Material-UI (MUI)** for UI components
- **Axios** for HTTP requests
- **React Hook Form** for form management
- **Context API** for state management

## Project Structure

```
the-raymon-app/
├── backend/
│   ├── config/
│   │   └── passport.js          # Passport OAuth configuration
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── models/
│   │   └── User.js              # User data model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── user.js              # User management routes
│   ├── uploads/                 # Profile image uploads
│   ├── server.js                # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js        # Navigation component
│   │   │   └── ProtectedRoute.js # Route protection
│   │   ├── contexts/
│   │   │   └── AuthContext.js   # Authentication context
│   │   ├── pages/
│   │   │   ├── Home.js          # Landing page
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Register.js      # Registration page
│   │   │   ├── Dashboard.js     # User dashboard
│   │   │   ├── Profile.js       # Profile management
│   │   │   └── AuthSuccess.js   # OAuth success handler
│   │   └── App.js               # Main app component
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or cloud instance)
- Google OAuth credentials (for Google authentication)
- Facebook App credentials (for Facebook authentication)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd golf-auth-service

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

Install and start MongoDB:

```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Or use MongoDB Atlas (cloud) for easier setup
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cd backend
cp .env.example .env  # If you have an example file
# Or create .env manually
```

Add the following environment variables to `.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/golf-auth-service

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# OAuth Credentials - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth Credentials - Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# OAuth Credentials - Vipps (Future)
VIPPS_CLIENT_ID=your_vipps_client_id
VIPPS_CLIENT_SECRET=your_vipps_client_secret

# Session Secret
SESSION_SECRET=your_session_secret_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 4. OAuth Setup

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

#### Facebook OAuth Setup:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URI: `http://localhost:5000/api/auth/facebook/callback`
5. Copy App ID and App Secret to your `.env` file

### 5. Frontend Configuration

Create a `.env` file in the frontend directory:

```bash
cd frontend
```

Add to `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 6. Run the Application

Start the backend server:

```bash
cd backend
npm run dev  # Development mode with auto-restart
# or
npm start    # Production mode
```

Start the frontend development server:

```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register with email/password
- `POST /login` - Login with email/password
- `GET /google` - Initiate Google OAuth
- `GET /google/callback` - Google OAuth callback
- `GET /facebook` - Initiate Facebook OAuth
- `GET /facebook/callback` - Facebook OAuth callback
- `GET /me` - Get current user
- `POST /logout` - Logout user
- `POST /refresh` - Refresh JWT token

### User Routes (`/api/user`)

- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /profile/image` - Upload profile image
- `DELETE /profile/image` - Delete profile image
- `PUT /password` - Change password (local accounts)
- `PUT /deactivate` - Deactivate account
- `DELETE /account` - Delete account permanently

## User Data Model

```javascript
{
  // OAuth provider IDs
  googleId: String,
  facebookId: String,
  vippsId: String,
  
  // Basic info
  email: String (required, unique),
  name: String (required),
  image: String,
  
  // Golf-specific
  golfHandicap: Number (required, -10.0 to 36.0),
  
  // Authentication
  password: String (for local accounts),
  provider: String ('local', 'google', 'facebook', 'vipps'),
  
  // Status fields
  isProfileComplete: Boolean,
  isActive: Boolean,
  isEmailVerified: Boolean,
  
  // Timestamps
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Golf Handicap System

The application supports golf handicaps in the range of -10.0 to 36.0:

- **Negative handicaps** (-10.0 to -0.1): Scratch+ players (better than scratch)
- **0 to 5**: Low handicap players
- **6 to 15**: Mid handicap players
- **16 to 25**: High handicap players
- **26 to 36**: Beginner players

The system validates that handicaps:
- Are within the valid range (-10.0 to 36.0)
- Have at most 1 decimal place
- Are properly formatted numbers

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configured for frontend domain
- **Helmet.js**: Security headers
- **Input Validation**: Comprehensive validation on all inputs
- **File Upload Security**: Type and size validation for images
- **Session Management**: Secure session handling

## Development

### Running in Development Mode

Backend with auto-restart:
```bash
cd backend
npm run dev
```

Frontend with hot reload:
```bash
cd frontend
npm start
```

### Environment Variables

Make sure to set different secrets for production:
- Use a strong, random JWT_SECRET
- Use a secure SESSION_SECRET
- Set NODE_ENV=production for production deployment
- Use HTTPS in production and update OAuth redirect URIs

## Deployment

### Backend Deployment
1. Set up a production MongoDB instance
2. Configure environment variables for production
3. Set up OAuth providers with production redirect URIs
4. Deploy to your preferred hosting service (Heroku, DigitalOcean, AWS, etc.)

### Frontend Deployment
1. Update REACT_APP_API_URL to point to production backend
2. Build the React app: `npm run build`
3. Deploy the build folder to a static hosting service (Netlify, Vercel, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Future Enhancements

- **Vipps Integration**: Complete Vipps OAuth implementation
- **Golf Round Tracking**: Add functionality to track golf rounds
- **Statistics Dashboard**: Handicap progression and statistics
- **Social Features**: Connect with other golfers
- **Tournament Management**: Organize and manage golf tournaments
- **Mobile App**: React Native mobile application

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed description

## License

This project is licensed under the MIT License - see the LICENSE file for details.
