const mongoose = require('mongoose');

const golfCourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    }
  },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(coordinates) {
          return coordinates.length === 2 && 
                 coordinates[0] >= -180 && coordinates[0] <= 180 && // longitude
                 coordinates[1] >= -90 && coordinates[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates'
      }
    }
  },
  
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  
  courseInfo: {
    holes: {
      type: Number,
      enum: [9, 18, 27, 36],
      default: 18
    },
    par: {
      type: Number,
      min: 27,
      max: 144
    },
    yardage: {
      type: Number,
      min: 1000,
      max: 10000
    },
    courseRating: {
      type: Number,
      min: 50,
      max: 80
    },
    slopeRating: {
      type: Number,
      min: 55,
      max: 155
    }
  },
  
  amenities: [{
    type: String,
    enum: [
      'Pro Shop',
      'Restaurant',
      'Bar',
      'Driving Range',
      'Putting Green',
      'Cart Rental',
      'Club Rental',
      'Lessons Available',
      'Locker Room',
      'Parking'
    ]
  }],
  
  pricing: {
    greenFee18: {
      type: Number,
      min: 0
    },
    greenFee9: {
      type: Number,
      min: 0
    },
    cartFee: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: 3
    }
  },
  
  description: {
    type: String,
    maxlength: 1000
  },
  
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: 200
    }
  }],
  
  // User-generated data
  rating: {
    average: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Administrative fields
  isActive: {
    type: Boolean,
    default: true
  },
  
  verified: {
    type: Boolean,
    default: false
  },
  
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for geospatial queries
golfCourseSchema.index({ location: '2dsphere' });
golfCourseSchema.index({ 'address.city': 1, 'address.state': 1 });
golfCourseSchema.index({ name: 'text', description: 'text' });

// Method to calculate distance from a point
golfCourseSchema.methods.getDistanceFrom = function(longitude, latitude) {
  const [courseLng, courseLat] = this.location.coordinates;
  
  // Haversine formula
  const R = 6371; // Earth's radius in kilometers
  const dLat = (courseLat - latitude) * Math.PI / 180;
  const dLng = (courseLng - longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(latitude * Math.PI / 180) * Math.cos(courseLat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in kilometers
};

// Static method to find courses near a location
golfCourseSchema.statics.findNearby = function(longitude, latitude, maxDistance = 50) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    isActive: true
  });
};

// Method to get formatted address
golfCourseSchema.methods.getFormattedAddress = function() {
  const { street, city, state, country, postalCode } = this.address;
  let address = street;
  if (city) address += `, ${city}`;
  if (state) address += `, ${state}`;
  if (postalCode) address += ` ${postalCode}`;
  if (country) address += `, ${country}`;
  return address;
};

// Method to get public data
golfCourseSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    address: this.address,
    location: this.location,
    contactInfo: this.contactInfo,
    courseInfo: this.courseInfo,
    amenities: this.amenities,
    pricing: this.pricing,
    description: this.description,
    images: this.images,
    rating: this.rating,
    formattedAddress: this.getFormattedAddress(),
    verified: this.verified
  };
};

module.exports = mongoose.model('GolfCourse', golfCourseSchema);
