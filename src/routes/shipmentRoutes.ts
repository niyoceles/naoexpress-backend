import express from 'express';
import { createNewShipment, getMyShipments, getShipmentById, updateStatus, updateShipmentDetails } from '../controllers/shipmentController';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.post('/', protect, createNewShipment);
router.get('/', protect, getMyShipments);
router.get('/:id', protect, getShipmentById);
router.patch('/:id/status', protect, authorize(UserRole.ADMIN, UserRole.COURIER, UserRole.WAREHOUSE_OP), updateStatus);
router.put('/:id/details', protect, authorize(UserRole.ADMIN), updateShipmentDetails);

export default router;
