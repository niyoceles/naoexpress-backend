import express from 'express';
import { getSupportDashboard, searchShipmentForSupport } from '../controllers/supportController';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect, authorize(UserRole.SUPPORT, UserRole.ADMIN));

router.get('/dashboard', getSupportDashboard);
router.get('/search', searchShipmentForSupport);

export default router;
