"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trackingController_1 = require("../controllers/trackingController");
const router = express_1.default.Router();
// Public route - no auth required for simple tracking
router.get('/:trackingNumber', trackingController_1.trackByNumber);
exports.default = router;
