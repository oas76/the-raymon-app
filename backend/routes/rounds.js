const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Round = require('../models/Round');
const GolfCourse = require('../models/GolfCourse');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all rounds with filtering and pagination
router.get('/', [
  authenticate,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['draft', 'open', 'full', 'in-progress', 'completed', 'cancelled']),
  query('gameFormat').optional().isString(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
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
      page = 1,
      limit = 10,
      status,
      gameFormat,
      dateFrom,
      dateTo,
      myRounds
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (gameFormat) filter.gameFormat = gameFormat;
    
    if (dateFrom || dateTo) {
      filter.scheduledDate = {};
      if (dateFrom) filter.scheduledDate.$gte = new Date(dateFrom);
      if (dateTo) filter.scheduledDate.$lte = new Date(dateTo);
    }

    // Filter for user's rounds only
    if (myRounds === 'true') {
      filter.$or = [
        { organizer: req.user._id },
        { 'teams.players.user': req.user._id }
      ];
    }

    const skip = (page - 1) * limit;
    
    const rounds = await Round.find(filter)
      .populate('organizer', 'name email image')
      .populate('golfCourse', 'name address location contactInfo')
      .populate('teams.players.user', 'name email image')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Round.countDocuments(filter);

    res.json({
      success: true,
      rounds: rounds.map(round => round.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get rounds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rounds'
    });
  }
});

// Get upcoming rounds
router.get('/upcoming', authenticate, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const rounds = await Round.findUpcoming(parseInt(limit));
    
    res.json({
      success: true,
      rounds: rounds.map(round => round.toPublicJSON())
    });
  } catch (error) {
    console.error('Get upcoming rounds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming rounds'
    });
  }
});

// Get single round
router.get('/:id', authenticate, async (req, res) => {
  try {
    const round = await Round.findById(req.params.id)
      .populate('organizer', 'name email image')
      .populate('golfCourse', 'name address location contactInfo courseInfo')
      .populate('teams.players.user', 'name email image golfHandicap');

    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }

    res.json({
      success: true,
      round: round.toPublicJSON()
    });
  } catch (error) {
    console.error('Get round error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch round'
    });
  }
});

// Create new round
router.post('/', [
  authenticate,
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Round name is required and must be less than 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('golfCourse').optional().isMongoId().withMessage('Invalid golf course ID'),
  body('customCourse.name').optional().trim().isLength({ min: 1, max: 200 }),
  body('customCourse.location').optional().trim().isLength({ min: 1, max: 200 }),
  body('scheduledDate').isISO8601().withMessage('Valid date is required'),
  body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
  body('gameFormat').isIn(['stroke-play', 'match-play', 'scramble', 'best-ball', 'alternate-shot', 'stableford', 'skins', 'nassau', 'wolf', 'bingo-bango-bongo']).withMessage('Invalid game format'),
  body('settings.holesCount').optional().isIn([9, 18]),
  body('settings.maxTeams').optional().isInt({ min: 1, max: 20 })
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
      name,
      description,
      golfCourse,
      customCourse,
      scheduledDate,
      scheduledTime,
      gameFormat,
      settings = {}
    } = req.body;

    // Validate golf course
    if (golfCourse) {
      const course = await GolfCourse.findById(golfCourse);
      if (!course) {
        return res.status(400).json({
          success: false,
          message: 'Golf course not found'
        });
      }
    } else if (!customCourse || !customCourse.name) {
      return res.status(400).json({
        success: false,
        message: 'Either golf course or custom course information is required'
      });
    }

    // Check if scheduled date is in the future
    if (new Date(scheduledDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date must be in the future'
      });
    }

    const round = new Round({
      name,
      description,
      organizer: req.user._id,
      golfCourse: golfCourse || undefined,
      customCourse: customCourse || undefined,
      scheduledDate,
      scheduledTime,
      gameFormat,
      settings: {
        holesCount: settings.holesCount || 18,
        allowGuests: settings.allowGuests !== false,
        maxTeams: settings.maxTeams || 8,
        isPrivate: settings.isPrivate || false,
        requireInvitation: settings.requireInvitation || false,
        registrationDeadline: settings.registrationDeadline || null
      }
    });

    await round.save();

    const populatedRound = await Round.findById(round._id)
      .populate('organizer', 'name email image')
      .populate('golfCourse', 'name address location contactInfo');

    res.status(201).json({
      success: true,
      message: 'Round created successfully',
      round: populatedRound.toPublicJSON()
    });
  } catch (error) {
    console.error('Create round error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create round'
    });
  }
});

// Update round
router.put('/:id', [
  authenticate,
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().isLength({ max: 1000 }),
  body('scheduledDate').optional().isISO8601(),
  body('scheduledTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('gameFormat').optional().isIn(['stroke-play', 'match-play', 'scramble', 'best-ball', 'alternate-shot', 'stableford', 'skins', 'nassau', 'wolf', 'bingo-bango-bongo'])
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

    const round = await Round.findById(req.params.id);
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }

    // Check if user is organizer
    if (!round.isOrganizer(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the organizer can update this round'
      });
    }

    // Prevent updates if round is in progress or completed
    if (['in-progress', 'completed'].includes(round.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update round that is in progress or completed'
      });
    }

    const allowedFields = ['name', 'description', 'scheduledDate', 'scheduledTime', 'gameFormat', 'settings'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(round, updates);
    await round.save();

    const populatedRound = await Round.findById(round._id)
      .populate('organizer', 'name email image')
      .populate('golfCourse', 'name address location contactInfo')
      .populate('teams.players.user', 'name email image');

    res.json({
      success: true,
      message: 'Round updated successfully',
      round: populatedRound.toPublicJSON()
    });
  } catch (error) {
    console.error('Update round error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update round'
    });
  }
});

// Join round (add team)
router.post('/:id/join', [
  authenticate,
  body('teamName').trim().isLength({ min: 1, max: 100 }).withMessage('Team name is required'),
  body('players').isArray({ min: 1, max: 4 }).withMessage('Team must have 1-4 players'),
  body('players.*.isGuest').optional().isBoolean(),
  body('players.*.user').optional().isMongoId(),
  body('players.*.guestInfo.name').optional().trim().isLength({ min: 1, max: 100 }),
  body('players.*.guestInfo.handicap').optional().isFloat({ min: -10, max: 36 }),
  body('players.*.roundHandicap').isFloat({ min: -10, max: 36 }).withMessage('Round handicap is required'),
  body('teamHandicap').optional().isFloat({ min: -40, max: 144 })
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

    const round = await Round.findById(req.params.id);
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }

    if (round.status !== 'open' && round.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot join this round'
      });
    }

    if (round.teams.length >= round.settings.maxTeams) {
      return res.status(400).json({
        success: false,
        message: 'Round is full'
      });
    }

    // Check if user is already participating
    if (round.isParticipating(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already participating in this round'
      });
    }

    const { teamName, players, teamHandicap = 0 } = req.body;

    // Validate players
    for (const player of players) {
      if (!player.isGuest && !player.user) {
        return res.status(400).json({
          success: false,
          message: 'Non-guest players must have a user ID'
        });
      }
      
      if (player.isGuest && (!player.guestInfo || !player.guestInfo.name)) {
        return res.status(400).json({
          success: false,
          message: 'Guest players must have name information'
        });
      }

      // Verify user exists
      if (player.user) {
        const user = await User.findById(player.user);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: 'One or more players not found'
          });
        }
      }
    }

    const team = {
      name: teamName,
      players: players.map(player => ({
        user: player.user || undefined,
        isGuest: player.isGuest || false,
        guestInfo: player.isGuest ? player.guestInfo : undefined,
        roundHandicap: player.roundHandicap,
        scores: []
      })),
      teamHandicap,
      totalScore: 0,
      netScore: 0
    };

    round.addTeam(team);
    await round.save();

    const populatedRound = await Round.findById(round._id)
      .populate('organizer', 'name email image')
      .populate('golfCourse', 'name address location contactInfo')
      .populate('teams.players.user', 'name email image');

    res.json({
      success: true,
      message: 'Successfully joined round',
      round: populatedRound.toPublicJSON()
    });
  } catch (error) {
    console.error('Join round error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join round'
    });
  }
});

// Leave round
router.delete('/:id/leave', authenticate, async (req, res) => {
  try {
    const round = await Round.findById(req.params.id);
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }

    if (!round.isParticipating(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not participating in this round'
      });
    }

    if (['in-progress', 'completed'].includes(round.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave round that is in progress or completed'
      });
    }

    // Remove user from all teams
    round.teams = round.teams.filter(team => {
      team.players = team.players.filter(player => 
        player.isGuest || !player.user || player.user.toString() !== req.user._id.toString()
      );
      return team.players.length > 0; // Keep teams that still have players
    });

    await round.save();

    res.json({
      success: true,
      message: 'Successfully left round'
    });
  } catch (error) {
    console.error('Leave round error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave round'
    });
  }
});

// Delete round
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const round = await Round.findById(req.params.id);
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }

    if (!round.isOrganizer(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the organizer can delete this round'
      });
    }

    if (['in-progress', 'completed'].includes(round.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete round that is in progress or completed'
      });
    }

    await Round.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Round deleted successfully'
    });
  } catch (error) {
    console.error('Delete round error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete round'
    });
  }
});

module.exports = router;
