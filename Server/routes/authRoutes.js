import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ message: errorMessages, errors: errors.array() });
    }

    const { username, email, password, phone, address, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      phone,
      address,
      role: role || 'user'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ message: errorMessages, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/google
// @desc    Google Login/Signup
// @access  Public
router.post('/google', async (req, res) => {
  const { tokenId, role } = req.body; // Accept role

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
    });

    console.log('Google Auth Ticket Payload:', ticket.getPayload());
    const { email, name, sub: googleId, picture } = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but no googleId (registered conventionally), link it
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      // Auto-upgrade logic: If user is 'user'/'renter' but logging in as 'partner', upgrade them
      if (role === 'partner' && (user.role === 'user' || user.role === 'renter')) {
        user.role = 'partner';
        await user.save();
      }

    } else {
      // Create new user
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      user = await User.create({
        username: name,
        email,
        password: randomPassword,
        googleId,
        role: role || 'user' // Use requested role or default
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ message: 'Google authentication failed' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;

      if (req.body.partnerDetails) {
        user.partnerDetails = {
          ...user.partnerDetails,
          ...req.body.partnerDetails
        };
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        drivingLicense: updatedUser.drivingLicense,
        aadharCard: updatedUser.aadharCard,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

import upload from '../middleware/uploadMiddleware.js';

// @route   POST /api/auth/upload-documents
// @desc    Upload user documents (Driving License, Aadhar Card)
// @access  Private
router.post('/upload-documents', protect, upload.fields([{ name: 'drivingLicense', maxCount: 1 }, { name: 'aadharCard', maxCount: 1 }]), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.files['drivingLicense']) {
        // Store relative path
        user.drivingLicense = `uploads/documents/${req.files['drivingLicense'][0].filename}`;
      }
      if (req.files['aadharCard']) {
        // Store relative path
        user.aadharCard = `uploads/documents/${req.files['aadharCard'][0].filename}`;
      }

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        drivingLicense: updatedUser.drivingLicense,
        aadharCard: updatedUser.aadharCard,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/kyc-upload
// @desc    Upload Partner KYC documents
// @access  Private
// Obsolete KYC Route - Schema changed to partnerDetails
// router.post('/kyc-upload', ... );

export default router;

// @route   GET /api/auth/partners
// @desc    Get all partners (Admin only)
// @access  Private/Admin
router.get('/partners', protect, admin, async (req, res) => {
  try {
    const partners = await User.find({ role: 'partner' }).select('-password');
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/auth/partners/:id/verify
// @desc    Verify or Reject a partner (Admin only)
// @access  Private/Admin
router.put('/partners/:id/verify', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isVerified = req.body.isVerified;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

