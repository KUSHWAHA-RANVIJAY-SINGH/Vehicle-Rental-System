import Contact from '../models/Contact.js';
import { validationResult } from 'express-validator';

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
export const createContact = async (req, res) => {
         try {
                  const errors = validationResult(req);
                  if (!errors.isEmpty()) {
                           return res.status(400).json({ errors: errors.array() });
                  }

                  const { name, email, message } = req.body;

                  const contact = await Contact.create({
                           name,
                           email,
                           message
                  });

                  res.status(201).json(contact);
         } catch (error) {
                  res.status(500).json({ message: 'Server error', error: error.message });
         }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
export const getContacts = async (req, res) => {
         try {
                  const contacts = await Contact.find().sort({ createdAt: -1 });
                  res.json(contacts);
         } catch (error) {
                  res.status(500).json({ message: 'Server error', error: error.message });
         }
};
