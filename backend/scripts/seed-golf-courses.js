const mongoose = require('mongoose');
require('dotenv').config();
const GolfCourse = require('../models/GolfCourse');

// Sample golf courses data
const sampleCourses = [
  {
    name: "Pebble Beach Golf Links",
    address: {
      street: "1700 17-Mile Drive",
      city: "Pebble Beach",
      state: "California",
      country: "USA",
      postalCode: "93953"
    },
    location: {
      type: "Point",
      coordinates: [-121.9499, 36.5687] // [longitude, latitude]
    },
    contactInfo: {
      phone: "+1-831-622-8723",
      email: "info@pebblebeach.com",
      website: "https://www.pebblebeach.com"
    },
    courseInfo: {
      holes: 18,
      par: 72,
      yardage: 6828,
      courseRating: 75.5,
      slopeRating: 145
    },
    amenities: ["Pro Shop", "Restaurant", "Bar", "Driving Range", "Putting Green", "Cart Rental", "Club Rental", "Lessons Available", "Locker Room", "Parking"],
    pricing: {
      greenFee18: 575,
      cartFee: 45,
      currency: "USD"
    },
    description: "One of the most famous golf courses in the world, Pebble Beach Golf Links offers breathtaking ocean views and challenging play along the rugged California coastline.",
    images: [
      {
        url: "https://example.com/pebble-beach-1.jpg",
        caption: "18th hole at Pebble Beach"
      }
    ],
    rating: {
      average: 4.8,
      count: 150
    },
    verified: true,
    isActive: true
  },
  {
    name: "Augusta National Golf Club",
    address: {
      street: "2604 Washington Rd",
      city: "Augusta",
      state: "Georgia",
      country: "USA",
      postalCode: "30904"
    },
    location: {
      type: "Point",
      coordinates: [-82.0199, 33.5030]
    },
    contactInfo: {
      phone: "+1-706-667-6000",
      website: "https://www.masters.com"
    },
    courseInfo: {
      holes: 18,
      par: 72,
      yardage: 7475,
      courseRating: 76.2,
      slopeRating: 137
    },
    amenities: ["Pro Shop", "Restaurant", "Driving Range", "Putting Green", "Locker Room", "Parking"],
    pricing: {
      greenFee18: 0, // Private club
      currency: "USD"
    },
    description: "Home of The Masters Tournament, Augusta National is one of golf's most prestigious and exclusive venues.",
    rating: {
      average: 5.0,
      count: 85
    },
    verified: true,
    isActive: true
  },
  {
    name: "St. Andrews Old Course",
    address: {
      street: "Golf Place",
      city: "St Andrews",
      state: "Fife",
      country: "Scotland",
      postalCode: "KY16 9SF"
    },
    location: {
      type: "Point",
      coordinates: [-2.8476, 56.3447]
    },
    contactInfo: {
      phone: "+44-1334-466666",
      email: "reservations@standrews.com",
      website: "https://www.standrews.com"
    },
    courseInfo: {
      holes: 18,
      par: 72,
      yardage: 7297,
      courseRating: 73.9,
      slopeRating: 129
    },
    amenities: ["Pro Shop", "Restaurant", "Bar", "Driving Range", "Putting Green", "Cart Rental", "Club Rental", "Lessons Available"],
    pricing: {
      greenFee18: 270,
      currency: "GBP"
    },
    description: "The Home of Golf, St. Andrews Old Course is the most famous golf course in the world and birthplace of the game.",
    rating: {
      average: 4.9,
      count: 200
    },
    verified: true,
    isActive: true
  },
  {
    name: "Royal County Down Golf Club",
    address: {
      street: "36 Golf Links Rd",
      city: "Newcastle",
      state: "County Down",
      country: "Northern Ireland",
      postalCode: "BT33 0AN"
    },
    location: {
      type: "Point",
      coordinates: [-5.8935, 54.2326]
    },
    contactInfo: {
      phone: "+44-28-4372-3314",
      website: "https://www.royalcountydown.org"
    },
    courseInfo: {
      holes: 18,
      par: 71,
      yardage: 7037,
      courseRating: 74.8,
      slopeRating: 139
    },
    amenities: ["Pro Shop", "Restaurant", "Bar", "Putting Green", "Locker Room"],
    pricing: {
      greenFee18: 250,
      currency: "GBP"
    },
    description: "Set against the dramatic backdrop of the Mountains of Mourne, Royal County Down is considered one of the finest links courses in the world.",
    rating: {
      average: 4.7,
      count: 95
    },
    verified: true,
    isActive: true
  },
  {
    name: "Pinehurst No. 2",
    address: {
      street: "1 Carolina Vista Dr",
      city: "Pinehurst",
      state: "North Carolina",
      country: "USA",
      postalCode: "28374"
    },
    location: {
      type: "Point",
      coordinates: [-79.4662, 35.1951]
    },
    contactInfo: {
      phone: "+1-855-235-8507",
      website: "https://www.pinehurst.com"
    },
    courseInfo: {
      holes: 18,
      par: 70,
      yardage: 7588,
      courseRating: 76.8,
      slopeRating: 144
    },
    amenities: ["Pro Shop", "Restaurant", "Bar", "Driving Range", "Putting Green", "Cart Rental", "Club Rental", "Lessons Available", "Locker Room", "Parking"],
    pricing: {
      greenFee18: 485,
      cartFee: 25,
      currency: "USD"
    },
    description: "Donald Ross's masterpiece, Pinehurst No. 2 has hosted multiple U.S. Opens and is known for its crowned greens and strategic design.",
    rating: {
      average: 4.6,
      count: 120
    },
    verified: true,
    isActive: true
  },
  {
    name: "Cypress Point Club",
    address: {
      street: "3150 17-Mile Drive",
      city: "Pebble Beach",
      state: "California",
      country: "USA",
      postalCode: "93953"
    },
    location: {
      type: "Point",
      coordinates: [-121.9721, 36.5847]
    },
    contactInfo: {
      phone: "+1-831-624-2223"
    },
    courseInfo: {
      holes: 18,
      par: 72,
      yardage: 6524,
      courseRating: 72.1,
      slopeRating: 129
    },
    amenities: ["Pro Shop", "Restaurant", "Putting Green", "Locker Room"],
    description: "An ultra-exclusive private club featuring some of the most spectacular holes in golf, including the famous par-3 16th hole.",
    rating: {
      average: 4.9,
      count: 45
    },
    verified: true,
    isActive: true
  },
  {
    name: "TPC Sawgrass - Stadium Course",
    address: {
      street: "110 Championship Way",
      city: "Ponte Vedra Beach",
      state: "Florida",
      country: "USA",
      postalCode: "32082"
    },
    location: {
      type: "Point",
      coordinates: [-81.3956, 30.1975]
    },
    contactInfo: {
      phone: "+1-904-273-3235",
      website: "https://www.tpc.com/sawgrass"
    },
    courseInfo: {
      holes: 18,
      par: 72,
      yardage: 7245,
      courseRating: 76.8,
      slopeRating: 155
    },
    amenities: ["Pro Shop", "Restaurant", "Bar", "Driving Range", "Putting Green", "Cart Rental", "Club Rental", "Lessons Available", "Locker Room", "Parking"],
    pricing: {
      greenFee18: 425,
      cartFee: 25,
      currency: "USD"
    },
    description: "Home of the PGA Tour's Players Championship, featuring the famous island green 17th hole.",
    rating: {
      average: 4.5,
      count: 180
    },
    verified: true,
    isActive: true
  },
  {
    name: "Whistling Straits - Straits Course",
    address: {
      street: "N8501 County Road LS",
      city: "Haven",
      state: "Wisconsin",
      country: "USA",
      postalCode: "53083"
    },
    location: {
      type: "Point",
      coordinates: [-87.7167, 43.6444]
    },
    contactInfo: {
      phone: "+1-920-565-6050",
      website: "https://www.destinationkohler.com/golf/whistling-straits"
    },
    courseInfo: {
      holes: 18,
      par: 72,
      yardage: 7790,
      courseRating: 77.9,
      slopeRating: 151
    },
    amenities: ["Pro Shop", "Restaurant", "Bar", "Driving Range", "Putting Green", "Cart Rental", "Club Rental", "Lessons Available", "Locker Room", "Parking"],
    pricing: {
      greenFee18: 515,
      cartFee: 30,
      currency: "USD"
    },
    description: "A dramatic links-style course along Lake Michigan, host to multiple major championships including the PGA Championship and Ryder Cup.",
    rating: {
      average: 4.7,
      count: 140
    },
    verified: true,
    isActive: true
  }
];

async function seedGolfCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/golf-auth-service', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Clear existing golf courses
    await GolfCourse.deleteMany({});
    console.log('Cleared existing golf courses');

    // Insert sample courses
    const insertedCourses = await GolfCourse.insertMany(sampleCourses);
    console.log(`Inserted ${insertedCourses.length} golf courses`);

    // Create indexes
    await GolfCourse.createIndexes();
    console.log('Created indexes');

    console.log('Golf course seeding completed successfully!');
    
    // Print some sample courses
    console.log('\nSample courses added:');
    insertedCourses.slice(0, 3).forEach(course => {
      console.log(`- ${course.name} (${course.address.city}, ${course.address.country})`);
    });

  } catch (error) {
    console.error('Error seeding golf courses:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedGolfCourses();
}

module.exports = seedGolfCourses;
