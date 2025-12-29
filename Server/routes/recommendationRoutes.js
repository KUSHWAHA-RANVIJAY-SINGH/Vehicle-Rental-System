import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getRecommendationsForUser } from '../controllers/recommendationController.js';

const router = express.Router();

// Get recommendations for a user (authenticated)
router.get('/user/:id', protect, getRecommendationsForUser);

export default router;