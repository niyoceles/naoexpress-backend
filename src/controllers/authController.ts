import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken, generateRefreshToken } from '../services/authService';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, phone } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, role, phone });
        
        const token = generateToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        res.status(201).json({
            success: true,
            data: { _id: user._id, name, email, role, token, refreshToken }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id.toString());
            const refreshToken = generateRefreshToken(user._id.toString());

            res.status(200).json({
                success: true,
                data: { _id: user._id, name: user.name, email, role: user.role, token, refreshToken }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMe = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
