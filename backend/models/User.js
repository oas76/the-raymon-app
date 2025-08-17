const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // OAuth provider information
  googleId: {
    type: String,
    sparse: true
  },
  facebookId: {
    type: String,
    sparse: true
  },
  vippsId: {
    type: String,
    sparse: true
  },
  
  // Basic user information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  // User profile information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  image: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        // Allow null/empty or valid URL/base64 format
        if (!v) return true;
        return /^(https?:\/\/.*|data:image\/.*|\/uploads\/.*)/.test(v);
      },
      message: 'Invalid image format'
    }
  },
  
  golfHandicap: {
    type: Number,
    required: true,
    min: -10.0,
    max: 36.0,
    validate: {
      validator: function(v) {
        // Check if the number has at most 1 decimal place
        return /^-?\d+(\.\d{1})?$/.test(v.toString());
      },
      message: 'Golf handicap must have at most 1 decimal place'
    }
  },
  
  // Authentication fields
  password: {
    type: String,
    required: function() {
      // Password required only if no OAuth provider is used
      return !this.googleId && !this.facebookId && !this.vippsId;
    },
    minlength: 6
  },
  
  // OAuth provider info
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook', 'vipps'],
    default: 'local'
  },
  
  // Profile completion status
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ facebookId: 1 }, { sparse: true });
userSchema.index({ vippsId: 1 }, { sparse: true });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified and exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if profile is complete
userSchema.methods.checkProfileComplete = function() {
  const isComplete = !!(
    this.name && 
    this.golfHandicap !== undefined && 
    this.golfHandicap !== null &&
    this.golfHandicap >= -10.0 && 
    this.golfHandicap <= 36.0
  );
  
  if (this.isProfileComplete !== isComplete) {
    this.isProfileComplete = isComplete;
  }
  
  return isComplete;
};

// Method to get public profile
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    image: this.image,
    golfHandicap: this.golfHandicap,
    provider: this.provider,
    isProfileComplete: this.isProfileComplete,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin
  };
};

// Static method to find user by OAuth ID
userSchema.statics.findByOAuthId = function(provider, oauthId) {
  const query = {};
  query[`${provider}Id`] = oauthId;
  return this.findOne(query);
};

module.exports = mongoose.model('User', userSchema);
