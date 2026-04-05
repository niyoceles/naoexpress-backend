"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supportController_1 = require("../controllers/supportController");
const auth_1 = require("../middlewares/auth");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.use(auth_1.protect, (0, auth_1.authorize)(User_1.UserRole.SUPPORT, User_1.UserRole.ADMIN));
router.get('/dashboard', supportController_1.getSupportDashboard);
router.get('/search', supportController_1.searchShipmentForSupport);
exports.default = router;
