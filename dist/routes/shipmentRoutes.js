"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shipmentController_1 = require("../controllers/shipmentController");
const auth_1 = require("../middlewares/auth");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post('/', auth_1.protect, shipmentController_1.createNewShipment);
router.get('/', auth_1.protect, shipmentController_1.getMyShipments);
router.get('/:id', auth_1.protect, shipmentController_1.getShipmentById);
router.patch('/:id/status', auth_1.protect, (0, auth_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.COURIER, User_1.UserRole.WAREHOUSE_OP), shipmentController_1.updateStatus);
router.put('/:id/details', auth_1.protect, (0, auth_1.authorize)(User_1.UserRole.ADMIN), shipmentController_1.updateShipmentDetails);
exports.default = router;
