"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const warehouseController_1 = require("../controllers/warehouseController");
const auth_1 = require("../middlewares/auth");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post('/', auth_1.protect, (0, auth_1.authorize)(User_1.UserRole.ADMIN), warehouseController_1.createWarehouse);
router.get('/', auth_1.protect, warehouseController_1.getWarehouses);
router.get('/:id', auth_1.protect, warehouseController_1.getWarehouseById);
exports.default = router;
