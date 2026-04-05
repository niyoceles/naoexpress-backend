import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'relay_xpress_secret_key_2024', {
        expiresIn: '1d'
    });
};

export const generateRefreshToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'relay_xpress_refresh_secret_key_2024', {
        expiresIn: '7d'
    });
};
