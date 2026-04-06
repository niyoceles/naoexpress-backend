import express from 'express';
import {
    getAnalyticsOverview,
    getAllUsers,
    getAllShipments,
    getUserById,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser
} from '../controllers/adminController';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Middleware setup: Use protect globally, but authorize roles specifically
router.use(protect);

router.get('/analytics/overview', authorize(UserRole.ADMIN), getAnalyticsOverview);
router.get('/shipments', authorize(UserRole.ADMIN, UserRole.WAREHOUSE_OP), getAllShipments);

// User CRUD
router.get('/users',          authorize(UserRole.ADMIN, UserRole.WAREHOUSE_OP), getAllUsers);
router.post('/users',         authorize(UserRole.ADMIN), createUser);
router.get('/users/:id',      authorize(UserRole.ADMIN), getUserById);
router.put('/users/:id',      authorize(UserRole.ADMIN), updateUser);
router.patch('/users/:id/toggle-status', authorize(UserRole.ADMIN), toggleUserStatus);
router.delete('/users/:id',   authorize(UserRole.ADMIN), deleteUser);

export default router;

