import express from 'express';
import { body } from 'express-validator';
import { protect, admin } from '../middleware/authMiddleware.js';
import { createContact, getContacts } from '../controllers/contactController.js';

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a contact message
// @access  Public
router.post('/', [
         body('name').notEmpty().withMessage('Name is required'),
         body('email').isEmail().withMessage('Please include a valid email'),
         body('message').notEmpty().withMessage('Message is required')
], createContact);

// @route   GET /api/contact
// @desc    Get all contact messages (admin only)
// @access  Private/Admin
router.get('/', protect, admin, getContacts);

export default router;
