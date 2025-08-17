const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findByOAuthId('google', profile.id);
      
      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }
      
      // Check if user exists with same email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.provider = 'google';
        user.isEmailVerified = true;
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }
      
      // Create new user
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        image: profile.photos[0]?.value || null,
        provider: 'google',
        isEmailVerified: true,
        golfHandicap: 0, // Default value, user will need to update
        lastLogin: new Date()
      });
      
      await user.save();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name', 'photos']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Facebook ID
      let user = await User.findByOAuthId('facebook', profile.id);
      
      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }
      
      // Get email from profile
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      
      if (!email) {
        return done(new Error('Email not provided by Facebook'), null);
      }
      
      // Check if user exists with same email
      user = await User.findOne({ email: email });
      
      if (user) {
        // Link Facebook account to existing user
        user.facebookId = profile.id;
        user.provider = 'facebook';
        user.isEmailVerified = true;
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }
      
      // Create new user
      const fullName = `${profile.name.givenName} ${profile.name.familyName}`;
      
      user = new User({
        facebookId: profile.id,
        name: fullName,
        email: email,
        image: profile.photos[0]?.value || null,
        provider: 'facebook',
        isEmailVerified: true,
        golfHandicap: 0, // Default value, user will need to update
        lastLogin: new Date()
      });
      
      await user.save();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

// JWT Strategy for API authentication
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret'
},
async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Vipps OAuth Strategy (Placeholder - Vipps uses OAuth 2.0)
// Note: Vipps primarily operates in Norway and requires special business agreements
// This is a placeholder implementation that would need to be customized based on
// Vipps' actual OAuth implementation details
if (process.env.VIPPS_CLIENT_ID && process.env.VIPPS_CLIENT_SECRET) {
  // Vipps implementation would go here
  // This would require custom OAuth2 strategy or their specific SDK
  console.log('Vipps OAuth configuration detected but not implemented yet');
  console.log('Note: Vipps requires special business agreements and Norwegian market access');
}

module.exports = passport;
