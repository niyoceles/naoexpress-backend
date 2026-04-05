"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middlewares/auth");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// All admin routes require Auth + Admin role
router.use(auth_1.protect, (0, auth_1.authorize)(User_1.UserRole.ADMIN));
router.get('/analytics/overview', adminController_1.getAnalyticsOverview);
router.get('/shipments', adminController_1.getAllShipments);
// User CRUD
router.get('/users', adminController_1.getAllUsers);
router.post('/users', adminController_1.createUser);
router.get('/users/:id', adminController_1.getUserById);
router.put('/users/:id', adminController_1.updateUser);
router.patch('/users/:id/toggle-status', adminController_1.toggleUserStatus);
router.delete('/users/:id', adminController_1.deleteUser);
exports.default = router;
