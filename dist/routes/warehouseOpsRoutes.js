"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const warehouseOpsController_1 = require("../controllers/warehouseOpsController");
const auth_1 = require("../middlewares/auth");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.use(auth_1.protect, (0, auth_1.authorize)(User_1.UserRole.WAREHOUSE_OP, User_1.UserRole.ADMIN));
router.get('/analytics', warehouseOpsController_1.getWarehouseAnalytics);
exports.default = router;
