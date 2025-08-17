const express = require('express');
const { body, validationResult, query } = require('express-validator');
const GolfCourse = require('../models/GolfCourse');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Search golf courses by location
router.get('/search', [
  optionalAuth,
  query('location').optional().isString().withMessage('Location must be a string'),
  query('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('radius').optional().isInt({ min: 1, max: 100 }).withMessage('Radius must be between 1 and 100 km'),
  query('name').optional().isString().withMessage('Name must be a string'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      location,
      latitude,
      longitude,
      radius = 50,
      name,
      page = 1,
      limit = 20
    } = req.query;

    let filter = { isActive: true };
    let sortOptions = {};

    // Text search by name or description
    if (name) {
      filter.$text = { $search: name };
      sortOptions.score = { $meta: 'textScore' };
    }

    let query = GolfCourse.find(filter);

    // Geospatial search
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const maxDistance = parseInt(radius) * 1000; // Convert km to meters

      query = GolfCourse.find({
        ...filter,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: maxDistance
          }
        }
      });
    } else if (location) {
      // Simple location text search
      filter.$or = [
        { 'address.city': new RegExp(location, 'i') },
        { 'address.state': new RegExp(location, 'i') },
        { 'address.country': new RegExp(location, 'i') },
        { name: new RegExp(location, 'i') }
      ];
      query = GolfCourse.find(filter);
    }

    // Apply sorting
    if (Object.keys(sortOptions).length > 0) {
      query = query.sort(sortOptions);
    } else {
      query = query.sort({ name: 1 });
    }

    // Pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(parseInt(limit));

    const courses = await query.exec();
    
    // Get total count for pagination
    const totalQuery = latitude && longitude ? 
      GolfCourse.find({
        ...filter,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: parseInt(radius) * 1000
          }
        }
      }) : GolfCourse.find(filter);
    
    const total = await totalQuery.countDocuments();

    // Calculate distances if coordinates provided
    const coursesWithDistance = latitude && longitude ? 
      courses.map(course => {
        const distance = course.getDistanceFrom(parseFloat(longitude), parseFloat(latitude));
        const courseData = course.toPublicJSON();
        courseData.distance = Math.round(distance * 10) / 10; // Round to 1 decimal
        return courseData;
      }) : 
      courses.map(course => course.toPublicJSON());

    res.json({
      success: true,
      courses: coursesWithDistance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      searchParams: {
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        radius: parseInt(radius)
      }
    });
  } catch (error) {
    console.error('Search golf courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search golf courses'
    });
  }
});

// Get popular golf courses
router.get('/popular', optionalAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const courses = await GolfCourse.find({ 
      isActive: true,
      verified: true 
    })
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      courses: courses.map(course => course.toPublicJSON())
    });
  } catch (error) {
    console.error('Get popular courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular courses'
    });
  }
});

// Get nearby courses
router.get('/nearby', [
  optionalAuth,
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius').optional().isInt({ min: 1, max: 100 }).withMessage('Radius must be between 1 and 100 km'),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { latitude, longitude, radius = 25, limit = 20 } = req.query;
    
    const courses = await GolfCourse.findNearby(
      parseFloat(longitude), 
      parseFloat(latitude), 
      parseInt(radius)
    ).limit(parseInt(limit));

    const coursesWithDistance = courses.map(course => {
      const distance = course.getDistanceFrom(parseFloat(longitude), parseFloat(latitude));
      const courseData = course.toPublicJSON();
      courseData.distance = Math.round(distance * 10) / 10;
      return courseData;
    });

    res.json({
      success: true,
      courses: coursesWithDistance
    });
  } catch (error) {
    console.error('Get nearby courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby courses'
    });
  }
});

// Get single golf course
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const course = await GolfCourse.findById(req.params.id);
    
    if (!course || !course.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Golf course not found'
      });
    }

    res.json({
      success: true,
      course: course.toPublicJSON()
    });
  } catch (error) {
    console.error('Get golf course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch golf course'
    });
  }
});

// Create new golf course (authenticated users only)
router.post('/', [
  authenticate,
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Course name is required'),
  body('address.street').trim().isLength({ min: 1 }).withMessage('Street address is required'),
  body('address.city').trim().isLength({ min: 1 }).withMessage('City is required'),
  body('address.country').trim().isLength({ min: 1 }).withMessage('Country is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('location.coordinates.*').isFloat().withMessage('Coordinates must be numbers'),
  body('contactInfo.phone').optional().isMobilePhone(),
  body('contactInfo.email').optional().isEmail(),
  body('contactInfo.website').optional().isURL(),
  body('courseInfo.holes').optional().isIn([9, 18, 27, 36]),
  body('courseInfo.par').optional().isInt({ min: 27, max: 144 }),
  body('description').optional().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const courseData = {
      ...req.body,
      addedBy: req.user._id,
      verified: false // New courses need verification
    };

    // Validate coordinates
    const [lng, lat] = courseData.location.coordinates;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    const course = new GolfCourse(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Golf course created successfully. It will be reviewed before being published.',
      course: course.toPublicJSON()
    });
  } catch (error) {
    console.error('Create golf course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create golf course'
    });
  }
});

// Update golf course (only creator or admin)
router.put('/:id', [
  authenticate,
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().isLength({ max: 1000 }),
  body('contactInfo.phone').optional().isMobilePhone(),
  body('contactInfo.email').optional().isEmail(),
  body('contactInfo.website').optional().isURL(),
  body('courseInfo.holes').optional().isIn([9, 18, 27, 36]),
  body('courseInfo.par').optional().isInt({ min: 27, max: 144 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const course = await GolfCourse.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Golf course not found'
      });
    }

    // Check if user can edit (creator or admin)
    if (course.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit golf courses you added'
      });
    }

    const allowedFields = [
      'name', 'description', 'contactInfo', 'courseInfo', 
      'amenities', 'pricing', 'images'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(course, updates);
    
    // Reset verification if significant changes
    if (updates.name || updates.address || updates.location) {
      course.verified = false;
    }
    
    await course.save();

    res.json({
      success: true,
      message: 'Golf course updated successfully',
      course: course.toPublicJSON()
    });
  } catch (error) {
    console.error('Update golf course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update golf course'
    });
  }
});

// Add course rating/review
router.post('/:id/rate', [
  authenticate,
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const course = await GolfCourse.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Golf course not found'
      });
    }

    const { rating } = req.body;

    // Simple rating update (in a real app, you'd store individual ratings)
    const currentAvg = course.rating.average;
    const currentCount = course.rating.count;
    
    const newCount = currentCount + 1;
    const newAverage = ((currentAvg * currentCount) + rating) / newCount;
    
    course.rating.average = Math.round(newAverage * 10) / 10;
    course.rating.count = newCount;
    
    await course.save();

    res.json({
      success: true,
      message: 'Rating added successfully',
      rating: {
        average: course.rating.average,
        count: course.rating.count
      }
    });
  } catch (error) {
    console.error('Rate golf course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate golf course'
    });
  }
});

// Geocoding helper endpoint (for converting address to coordinates)
router.post('/geocode', [
  authenticate,
  body('address').trim().isLength({ min: 1 }).withMessage('Address is required')
], async (req, res) => {
  try {
    const { address } = req.body;
    
    // This is a placeholder - in production, you'd use a geocoding service like:
    // - Google Maps Geocoding API
    // - Mapbox Geocoding API
    // - OpenStreetMap Nominatim
    
    // For now, return mock coordinates
    res.json({
      success: true,
      message: 'Geocoding service not implemented. Please provide coordinates manually.',
      coordinates: null,
      suggestion: 'Use a service like Google Maps to find coordinates for your address'
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Geocoding failed'
    });
  }
});

module.exports = router;
