import express from 'express';
import { generateDescription } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-description', generateDescription);

export default router;
