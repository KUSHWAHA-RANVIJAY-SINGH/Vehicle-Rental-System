import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Partner from '../models/Partner.js';
import { generateToken } from '../utils/generateToken.js';
import { protect, admin, authenticatePartner } from '../middleware/authMiddleware.js';
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

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered. Please login.' });
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken. Please choose another one.' });
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
        role: user.role,
        phone: user.phone,
        address: user.address,
        drivingLicense: user.drivingLicense,
        aadharCard: user.aadharCard,
        partnerDetails: user.partnerDetails
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
        role: user.role,
        phone: user.phone,
        address: user.address,
        drivingLicense: user.drivingLicense,
        aadharCard: user.aadharCard,
        partnerDetails: user.partnerDetails
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
        role: user.role,
        phone: user.phone,
        address: user.address,
        drivingLicense: user.drivingLicense,
        aadharCard: user.aadharCard,
        partnerDetails: user.partnerDetails
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ message: 'Google authentication failed' });
  }
});

// @route   POST /api/auth/partner/register
// @desc    Register a new partner
// @access  Public
router.post('/partner/register', [
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

    const { username, email, password, phone, address } = req.body;

    // Check if email already exists
    const emailExists = await Partner.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered as a Partner. Please login.' });
    }

    // Check if username already exists
    const usernameExists = await Partner.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken. Please choose another one.' });
    }

    // Create partner
    const partner = await Partner.create({
      username,
      email,
      password,
      phone,
      address,
      role: 'partner'
    });

    const token = generateToken(partner._id);

    res.status(201).json({
      token,
      user: {
        id: partner._id,
        username: partner.username,
        email: partner.email,
        role: partner.role,
        phone: partner.phone,
        address: partner.address,
        partnerDetails: partner.partnerDetails,
        isVerified: partner.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/partner/login
// @desc    Login partner
// @access  Public
router.post('/partner/login', [
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

    // Find partner
    const partner = await Partner.findOne({ email });
    if (!partner) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await partner.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(partner._id);

    res.json({
      token,
      user: {
        id: partner._id,
        username: partner.username,
        email: partner.email,
        role: partner.role,
        phone: partner.phone,
        address: partner.address,
        partnerDetails: partner.partnerDetails,
        isVerified: partner.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/partner/google
// @desc    Google Partner Login/Signup
// @access  Public
router.post('/partner/google', async (req, res) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    // Check if partner exists
    let partner = await Partner.findOne({ email });

    if (partner) {
      if (!partner.googleId) {
        partner.googleId = googleId;
        await partner.save();
      }
    } else {
      // Create new partner
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      partner = await Partner.create({
        username: name,
        email,
        password: randomPassword,
        googleId,
        role: 'partner'
      });
    }

    const token = generateToken(partner._id);

    res.json({
      token,
      user: {
        id: partner._id,
        username: partner.username,
        email: partner.email,
        role: partner.role,
        phone: partner.phone,
        address: partner.address,
        partnerDetails: partner.partnerDetails,
        isVerified: partner.isVerified
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ message: 'Google authentication failed' });
  }
});

// @route   GET /api/auth/partner/profile
// @desc    Get partner profile
// @access  Private (Partner)
router.get('/partner/profile', authenticatePartner, async (req, res) => {
  try {
    // req.user is already fetched by authenticatePartner
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/auth/partner/profile
// @desc    Update partner profile
// @access  Private (Partner)
router.put('/partner/profile', authenticatePartner, async (req, res) => {
  try {
    const partner = req.user; // Already fetched by middleware
    console.log('PUT /partner/profile payload:', req.body);
    console.log('Existing partner details:', partner.partnerDetails);

    if (partner) {
      partner.username = req.body.username || partner.username;
      partner.email = req.body.email || partner.email;
      partner.phone = req.body.phone || partner.phone;
      partner.address = req.body.address || partner.address;

      if (req.body.partnerDetails) {
        partner.partnerDetails = req.body.partnerDetails;
      }

      if (req.body.password) {
        partner.password = req.body.password;
      }

      const updatedPartner = await partner.save();
      console.log('Updated partner details:', updatedPartner.partnerDetails);

      res.json({
        id: updatedPartner._id,
        username: updatedPartner.username,
        email: updatedPartner.email,
        role: updatedPartner.role,
        phone: updatedPartner.phone,
        address: updatedPartner.address,
        partnerDetails: updatedPartner.partnerDetails,
        isVerified: updatedPartner.isVerified
      });
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
        user.partnerDetails = req.body.partnerDetails;
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
// @route   POST /api/auth/kyc-upload
// @desc    Upload Partner KYC documents
// @access  Private (Partner)
router.post('/kyc-upload', authenticatePartner, upload.fields([{ name: 'aadharCard', maxCount: 1 }, { name: 'panCard', maxCount: 1 }]), async (req, res) => {
  try {
    const partner = req.user;

    if (partner) {
      if (req.files['aadharCard']) {
        partner.aadharCard = `uploads/documents/${req.files['aadharCard'][0].filename}`;
      }
      if (req.files['panCard']) {
        partner.panCardImage = `uploads/documents/${req.files['panCard'][0].filename}`;
      }

      await partner.save();

      res.json({ message: 'KYC Documents Uploaded Successfully' });
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    console.error('KYC Upload Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

// @route   GET /api/auth/users
// @desc    Get all users (renters) (Admin only)
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    // Fetch users with role 'user' or 'renter'
    const users = await User.find({ role: { $in: ['user', 'renter'] } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/partners
// @desc    Get all partners (Admin only)
// @access  Private/Admin
router.get('/partners', protect, admin, async (req, res) => {
  try {
    console.log('GET /partners request received');
    // Fetch from new Partner collection
    const partnerDocs = await Partner.find({}).select('-password');
    // Fetch legacy partners from User collection
    const userPartners = await User.find({ role: 'partner' }).select('-password');

    // Deduplicate: Filter out users who already exist in Partner collection (by email)
    const partnerEmails = new Set(partnerDocs.map(p => p.email));
    const uniqueUserPartners = userPartners.filter(u => !partnerEmails.has(u.email));

    // Combine them
    const allPartners = [...partnerDocs, ...uniqueUserPartners];
    console.log(`Return ${allPartners.length} partners:`, allPartners.map(p => p.username));
    res.json(allPartners);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/auth/partners/:id/verify
// @desc    Verify or Reject a partner (Admin only)
// @access  Private/Admin
router.put('/partners/:id/verify', protect, admin, async (req, res) => {
  try {
    let partner = await Partner.findById(req.params.id);

    if (partner) {
      partner.isVerified = req.body.isVerified;
      await partner.save();
      return res.json(partner);
    }

    // Fallback to User collection (legacy)
    let user = await User.findById(req.params.id);
    if (user) {
      user.isVerified = req.body.isVerified;
      const updatedUser = await user.save();
      return res.json(updatedUser);
    }

    res.status(404).json({ message: 'Partner not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

