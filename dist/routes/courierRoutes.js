"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courierController_1 = require("../controllers/courierController");
const auth_1 = require("../middlewares/auth");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.use(auth_1.protect, (0, auth_1.authorize)(User_1.UserRole.COURIER, User_1.UserRole.ADMIN));
router.get('/analytics', courierController_1.getCourierAnalytics);
router.get('/completed', courierController_1.getCourierCompletedDeliveries);
exports.default = router;
