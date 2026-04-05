"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventoryController_1 = require("../controllers/inventoryController");
const auth_1 = require("../middlewares/auth");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.use(auth_1.protect, (0, auth_1.authorize)(User_1.UserRole.WAREHOUSE_OP, User_1.UserRole.ADMIN));
router.get('/skus', inventoryController_1.getSKUs);
router.post('/stock-in', inventoryController_1.stockIn);
router.patch('/:id/quantity', inventoryController_1.updateStockLevel);
exports.default = router;
