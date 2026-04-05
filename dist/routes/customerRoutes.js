"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerController_1 = require("../controllers/customerController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
// Any authenticated individual uses the customer dashboard default
router.get('/analytics', auth_1.protect, customerController_1.getCustomerAnalytics);
exports.default = router;
