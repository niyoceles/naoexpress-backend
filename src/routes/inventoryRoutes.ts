import express from 'express';
import { getSKUs, stockIn, updateStockLevel, createProduct, dispatchInventory } from '../controllers/inventoryController';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect, authorize(UserRole.WAREHOUSE_OP, UserRole.ADMIN));

router.get('/skus', getSKUs);
router.post('/stock-in', stockIn);
router.post('/create', createProduct);
router.post('/dispatch', dispatchInventory);
router.patch('/:id/quantity', updateStockLevel);

export default router;
