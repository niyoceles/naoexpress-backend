import express from 'express';
import { getWarehouseAnalytics, assignShipment } from '../controllers/warehouseOpsController';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect, authorize(UserRole.WAREHOUSE_OP, UserRole.ADMIN));

router.get('/analytics', authorize(UserRole.WAREHOUSE_OP, UserRole.ADMIN), getWarehouseAnalytics);
router.patch('/:id/assign', authorize(UserRole.ADMIN), assignShipment);


export default router;
