const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.isGuest;
    }
  },
  
  // Guest player information
  isGuest: {
    type: Boolean,
    default: false
  },
  
  guestInfo: {
    name: {
      type: String,
      required: function() {
        return this.isGuest;
      },
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    handicap: {
      type: Number,
      min: -10.0,
      max: 36.0,
      default: 36.0
    }
  },
  
  // Player's handicap for this round (can be different from profile)
  roundHandicap: {
    type: Number,
    min: -10.0,
    max: 36.0,
    required: true
  },
  
  // Scores for each hole
  scores: [{
    hole: {
      type: Number,
      required: true,
      min: 1,
      max: 18
    },
    strokes: {
      type: Number,
      min: 1,
      max: 15
    },
    putts: {
      type: Number,
      min: 0,
      max: 10
    }
  }],
  
  totalScore: {
    type: Number,
    min: 18,
    max: 300
  },
  
  netScore: {
    type: Number
  }
}, { _id: false });

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  players: {
    type: [playerSchema],
    validate: {
      validator: function(players) {
        return players.length >= 1 && players.length <= 4;
      },
      message: 'Team must have between 1 and 4 players'
    }
  },
  
  teamHandicap: {
    type: Number,
    default: 0,
    min: -40.0,
    max: 144.0
  },
  
  totalScore: {
    type: Number,
    min: 18,
    max: 1200
  },
  
  netScore: {
    type: Number
  },
  
  // Team ranking in the round
  position: {
    type: Number,
    min: 1
  }
}, { _id: false });

const roundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  
  // Round organizer
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Golf course information
  golfCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GolfCourse'
    // Not required - can use customCourse instead
  },
  
  // Custom course info if not in database
  customCourse: {
    name: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    holes: {
      type: Number,
      enum: [9, 18],
      default: 18
    },
    par: {
      type: Number,
      min: 27,
      max: 144
    }
  },
  
  // Date and time
  scheduledDate: {
    type: Date,
    required: true
  },
  
  scheduledTime: {
    type: String,
    required: true,
    validate: {
      validator: function(time) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'Time must be in HH:MM format'
    }
  },
  
  // Game format
  gameFormat: {
    type: String,
    required: true,
    enum: [
      'stroke-play',
      'match-play',
      'scramble',
      'best-ball',
      'alternate-shot',
      'stableford',
      'skins',
      'nassau',
      'wolf',
      'bingo-bango-bongo'
    ]
  },
  
  // Round settings
  settings: {
    holesCount: {
      type: Number,
      enum: [9, 18],
      default: 18
    },
    
    allowGuests: {
      type: Boolean,
      default: true
    },
    
    maxTeams: {
      type: Number,
      min: 1,
      max: 20,
      default: 8
    },
    
    isPrivate: {
      type: Boolean,
      default: false
    },
    
    requireInvitation: {
      type: Boolean,
      default: false
    },
    
    registrationDeadline: {
      type: Date
    }
  },
  
  // Teams participating
  teams: [teamSchema],
  
  // Round status
  status: {
    type: String,
    enum: ['draft', 'open', 'full', 'in-progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Results and statistics
  results: {
    winner: {
      team: {
        type: String // Team name
      },
      score: {
        type: Number
      }
    },
    
    completed: {
      type: Boolean,
      default: false
    },
    
    completedAt: {
      type: Date
    }
  },
  
  // Weather conditions (optional)
  weather: {
    condition: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'windy', 'stormy']
    },
    temperature: {
      type: Number
    },
    windSpeed: {
      type: Number
    }
  },
  
  // Invitations sent
  invitations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Comments and updates
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
roundSchema.index({ organizer: 1 });
roundSchema.index({ golfCourse: 1 });
roundSchema.index({ scheduledDate: 1 });
roundSchema.index({ status: 1 });
roundSchema.index({ 'teams.players.user': 1 });

// Middleware to update status based on teams count
roundSchema.pre('save', function(next) {
  if (this.teams.length >= this.settings.maxTeams) {
    this.status = 'full';
  } else if (this.teams.length > 0 && this.status === 'draft') {
    this.status = 'open';
  }
  next();
});

// Method to check if user is organizer
roundSchema.methods.isOrganizer = function(userId) {
  return this.organizer.toString() === userId.toString();
};

// Method to check if user is participating
roundSchema.methods.isParticipating = function(userId) {
  return this.teams.some(team => 
    team.players.some(player => 
      !player.isGuest && player.user && player.user.toString() === userId.toString()
    )
  );
};

// Method to get available spots
roundSchema.methods.getAvailableSpots = function() {
  const totalSpots = this.settings.maxTeams * 4; // Max 4 players per team
  const occupiedSpots = this.teams.reduce((total, team) => total + team.players.length, 0);
  return totalSpots - occupiedSpots;
};

// Method to add team
roundSchema.methods.addTeam = function(teamData) {
  if (this.teams.length >= this.settings.maxTeams) {
    throw new Error('Round is full');
  }
  
  this.teams.push(teamData);
  return this;
};

// Method to calculate team scores
roundSchema.methods.calculateTeamScores = function() {
  this.teams.forEach(team => {
    let teamTotal = 0;
    let teamNet = 0;
    
    team.players.forEach(player => {
      if (player.totalScore) {
        teamTotal += player.totalScore;
        teamNet += (player.netScore || player.totalScore);
      }
    });
    
    if (this.gameFormat === 'scramble' || this.gameFormat === 'best-ball') {
      // For team formats, use best score
      const bestScore = Math.min(...team.players.map(p => p.totalScore || 999));
      team.totalScore = bestScore;
      team.netScore = bestScore;
    } else {
      team.totalScore = teamTotal;
      team.netScore = teamNet;
    }
  });
  
  // Sort teams by score and assign positions
  this.teams.sort((a, b) => (a.netScore || 999) - (b.netScore || 999));
  this.teams.forEach((team, index) => {
    team.position = index + 1;
  });
};

// Method to get public data
roundSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    organizer: this.organizer,
    golfCourse: this.golfCourse,
    customCourse: this.customCourse,
    scheduledDate: this.scheduledDate,
    scheduledTime: this.scheduledTime,
    gameFormat: this.gameFormat,
    settings: this.settings,
    teams: this.teams,
    status: this.status,
    results: this.results,
    weather: this.weather,
    availableSpots: this.getAvailableSpots(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to find rounds by user participation
roundSchema.statics.findByUserParticipation = function(userId) {
  return this.find({
    $or: [
      { organizer: userId },
      { 'teams.players.user': userId }
    ]
  }).populate('organizer', 'name email')
    .populate('golfCourse', 'name address location')
    .sort({ scheduledDate: 1 });
};

// Static method to find upcoming rounds
roundSchema.statics.findUpcoming = function(limit = 10) {
  return this.find({
    scheduledDate: { $gte: new Date() },
    status: { $in: ['open', 'in-progress'] }
  }).populate('organizer', 'name email')
    .populate('golfCourse', 'name address location')
    .sort({ scheduledDate: 1 })
    .limit(limit);
};

module.exports = mongoose.model('Round', roundSchema);
