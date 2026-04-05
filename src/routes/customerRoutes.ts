import express from 'express';
import { getCustomerAnalytics } from '../controllers/customerController';
import { protect } from '../middlewares/auth';

const router = express.Router();

// Any authenticated individual uses the customer dashboard default
router.get('/analytics', protect, getCustomerAnalytics);

export default router;
