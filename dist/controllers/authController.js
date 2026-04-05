"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const authService_1 = require("../services/authService");
const register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        const user = await User_1.default.create({ name, email, password, role, phone });
        const token = (0, authService_1.generateToken)(user._id.toString());
        const refreshToken = (0, authService_1.generateRefreshToken)(user._id.toString());
        res.status(201).json({
            success: true,
            data: { _id: user._id, name, email, role, token, refreshToken }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email }).select('+password');
        if (user && (await user.comparePassword(password))) {
            const token = (0, authService_1.generateToken)(user._id.toString());
            const refreshToken = (0, authService_1.generateRefreshToken)(user._id.toString());
            res.status(200).json({
                success: true,
                data: { _id: user._id, name: user.name, email, role: user.role, token, refreshToken }
            });
        }
        else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMe = getMe;
