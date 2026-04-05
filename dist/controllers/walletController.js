"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestWithdrawal = exports.getWalletTransactions = exports.getWalletBalance = void 0;
const User_1 = __importDefault(require("../models/User"));
const WalletTransaction_1 = __importDefault(require("../models/WalletTransaction"));
const getWalletBalance = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id).select('walletBalance');
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, balance: user.walletBalance });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWalletBalance = getWalletBalance;
const getWalletTransactions = async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
        const transactions = await WalletTransaction_1.default.find(filter)
            .populate('shipmentId', 'trackingNumber')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: transactions.length, data: transactions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWalletTransactions = getWalletTransactions;
const requestWithdrawal = async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User_1.default.findById(req.user._id);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        if (user.walletBalance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }
        // 1. Create debit transaction
        await WalletTransaction_1.default.create({
            userId: user._id,
            amount: amount,
            type: 'debit',
            description: `Payout withdrawal request`
        });
        // 2. Atomic decrement
        user.walletBalance -= amount;
        await user.save();
        res.status(200).json({ success: true, balance: user.walletBalance });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.requestWithdrawal = requestWithdrawal;
