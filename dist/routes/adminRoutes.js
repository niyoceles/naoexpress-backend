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
// Middleware setup: Use protect globally, but authorize roles specifically
router.use(auth_1.protect);
router.get('/analytics/overview', (0, auth_1.authorize)(User_1.UserRole.ADMIN), adminController_1.getAnalyticsOverview);
router.get('/shipments', (0, auth_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.WAREHOUSE_OP), adminController_1.getAllShipments);
// User CRUD
router.get('/users', (0, auth_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.WAREHOUSE_OP), adminController_1.getAllUsers);
router.post('/users', (0, auth_1.authorize)(User_1.UserRole.ADMIN), adminController_1.createUser);
router.get('/users/:id', (0, auth_1.authorize)(User_1.UserRole.ADMIN), adminController_1.getUserById);
router.put('/users/:id', (0, auth_1.authorize)(User_1.UserRole.ADMIN), adminController_1.updateUser);
router.patch('/users/:id/toggle-status', (0, auth_1.authorize)(User_1.UserRole.ADMIN), adminController_1.toggleUserStatus);
router.delete('/users/:id', (0, auth_1.authorize)(User_1.UserRole.ADMIN), adminController_1.deleteUser);
exports.default = router;
