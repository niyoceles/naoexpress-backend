import express from 'express';
import { trackByNumber } from '../controllers/trackingController';

const router = express.Router();

// Public route - no auth required for simple tracking
router.get('/:trackingNumber', trackByNumber);

export default router;
