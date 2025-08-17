const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `profile-${req.user._id}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

// Update user profile
router.put('/profile', [
  authenticate,
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
  body('golfHandicap').optional().isFloat({ min: -10.0, max: 36.0 }).withMessage('Golf handicap must be between -10.0 and 36.0'),
  body('image').optional().isString()
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

    const { name, golfHandicap, image } = req.body;
    const user = req.user;

    // Update fields if provided
    if (name !== undefined) {
      user.name = name;
    }
    if (golfHandicap !== undefined) {
      user.golfHandicap = golfHandicap;
    }
    if (image !== undefined) {
      // If removing image (empty string or null)
      if (!image) {
        // Delete old image file if it exists
        if (user.image && user.image.startsWith('/uploads/')) {
          try {
            const imagePath = path.join(__dirname, '..', user.image);
            await fs.unlink(imagePath);
          } catch (err) {
            console.log('Could not delete old image file:', err.message);
          }
        }
      }
      user.image = image;
    }

    // Check if profile is complete
    user.checkProfileComplete();

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Upload profile image
router.post('/profile/image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const user = req.user;
    
    // Delete old image if it exists
    if (user.image && user.image.startsWith('/uploads/')) {
      try {
        const oldImagePath = path.join(__dirname, '..', user.image);
        await fs.unlink(oldImagePath);
      } catch (err) {
        console.log('Could not delete old image file:', err.message);
      }
    }

    // Update user with new image path
    const imagePath = `/uploads/profiles/${req.file.filename}`;
    user.image = imagePath;
    user.checkProfileComplete();
    
    await user.save();

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imagePath: imagePath,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Upload image error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// Delete profile image
router.delete('/profile/image', authenticate, async (req, res) => {
  try {
    const user = req.user;

    // Delete image file if it exists
    if (user.image && user.image.startsWith('/uploads/')) {
      try {
        const imagePath = path.join(__dirname, '..', user.image);
        await fs.unlink(imagePath);
      } catch (err) {
        console.log('Could not delete image file:', err.message);
      }
    }

    // Remove image from user profile
    user.image = null;
    user.checkProfileComplete();
    
    await user.save();

    res.json({
      success: true,
      message: 'Profile image deleted successfully',
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
});

// Change password (for local accounts only)
router.put('/password', [
  authenticate,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Check if user has a local account
    if (user.provider !== 'local' || !user.password) {
      return res.status(400).json({
        success: false,
        message: 'Password change not available for OAuth accounts'
      });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// Deactivate account
router.put('/deactivate', authenticate, async (req, res) => {
  try {
    const user = req.user;
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account',
      error: error.message
    });
  }
});

// Delete account permanently
router.delete('/account', authenticate, async (req, res) => {
  try {
    const user = req.user;

    // Delete profile image if it exists
    if (user.image && user.image.startsWith('/uploads/')) {
      try {
        const imagePath = path.join(__dirname, '..', user.image);
        await fs.unlink(imagePath);
      } catch (err) {
        console.log('Could not delete image file:', err.message);
      }
    }

    // Delete user from database
    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
});

module.exports = router;
