import express from 'express';
import { createWarehouse, getWarehouses, getWarehouseById } from '../controllers/warehouseController';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.post('/', protect, authorize(UserRole.ADMIN), createWarehouse);
router.get('/', protect, getWarehouses);
router.get('/:id', protect, getWarehouseById);

export default router;
