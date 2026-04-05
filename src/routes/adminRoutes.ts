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

// All admin routes require Auth + Admin role
router.use(protect, authorize(UserRole.ADMIN));

router.get('/analytics/overview', getAnalyticsOverview);
router.get('/shipments', getAllShipments);

// User CRUD
router.get('/users',          getAllUsers);
router.post('/users',         createUser);
router.get('/users/:id',      getUserById);
router.put('/users/:id',      updateUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id',   deleteUser);

export default router;

