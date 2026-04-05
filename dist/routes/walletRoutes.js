"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const walletController_1 = require("../controllers/walletController");
const auth_1 = require("../middlewares/auth");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Only merchants should access their financial ledger natively in this portal
router.get('/balance', auth_1.protect, (0, auth_1.authorize)(User_1.UserRole.MERCHANT), walletController_1.getWalletBalance);
router.get('/transactions', auth_1.protect, (0, auth_1.authorize)(User_1.UserRole.MERCHANT), walletController_1.getWalletTransactions);
router.post('/withdraw', auth_1.protect, (0, auth_1.authorize)(User_1.UserRole.MERCHANT), walletController_1.requestWithdrawal);
exports.default = router;
