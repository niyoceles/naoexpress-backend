import express from 'express';
import { getCourierAnalytics, getCourierCompletedDeliveries } from '../controllers/courierController';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect, authorize(UserRole.COURIER, UserRole.ADMIN));

router.get('/analytics', getCourierAnalytics);
router.get('/completed', getCourierCompletedDeliveries);

export default router;
