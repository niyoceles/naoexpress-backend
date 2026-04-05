import { Request, Response } from 'express';
import User from '../models/User';
import Shipment, { ShipmentStatus } from '../models/Shipment';
import Organization from '../models/Organization';

import { UserRole } from '../models/User';

export const getAnalyticsOverview = async (req: Request, res: Response) => {
    try {
        const [totalShipments, delivered, failed, users] = await Promise.all([
            Shipment.countDocuments(),
            Shipment.countDocuments({ status: ShipmentStatus.DELIVERED }),
            Shipment.countDocuments({ status: ShipmentStatus.DELIVERY_FAILED }),
            User.countDocuments()
        ]);

        const pending = await Shipment.countDocuments({
            status: { $in: [ShipmentStatus.PENDING_PAYMENT, ShipmentStatus.PICKUP_SCHEDULED, ShipmentStatus.DRAFT] }
        });

        const inTransit = await Shipment.countDocuments({
            status: { $in: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.AT_DESTINATION_HUB, ShipmentStatus.OUT_FOR_DELIVERY] }
        });

        const deliveryRate = totalShipments > 0
            ? ((delivered / totalShipments) * 100).toFixed(1)
            : '0';

        // Revenue estimate (sum of shippingCost on delivered shipments)
        const revenueAgg = await Shipment.aggregate([
            { $match: { status: ShipmentStatus.DELIVERED } },
            { $group: { _id: null, total: { $sum: '$shippingCost' } } }
        ]);
        const estimatedRevenue = revenueAgg[0]?.total || 0;

        // Top destinations
        const topDestinations = await Shipment.aggregate([
            { $group: { _id: '$receiver.country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Generate 7-day chart data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const chartAgg = await Shipment.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    shipments: { $sum: 1 }
                } 
            },
            { $sort: { "_id": 1 } }
        ]);

        // Map into full 7 days array even for days with 0 shipments
        const chartData = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const yyyyMmDd = d.toISOString().split('T')[0];
            const displayDay = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayRecord = chartAgg.find(r => r._id === yyyyMmDd);
            chartData.push({ name: displayDay, shipments: dayRecord ? dayRecord.shipments : 0 });
        }

        res.status(200).json({
            success: true,
            data: {
                shipments: { total: totalShipments, delivered, failed, pending, inTransit },
                deliverySuccessRate: parseFloat(deliveryRate),
                estimatedRevenue,
                users: { total: users },
                topDestinations,
                chartData
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const page   = parseInt(req.query.page  as string) || 1;
        const limit  = parseInt(req.query.limit as string) || 50;
        const skip   = (page - 1) * limit;
        const role   = req.query.role   as string;
        const search = req.query.search as string;

        const filter: any = {};
        if (role) filter.role = role;
        if (search && search.trim()) {
            const regex = { $regex: search.trim(), $options: 'i' };
            filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
        }

        const [users, total] = await Promise.all([
            User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            User.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: users,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllShipments = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status as string;

        const filter: any = {};
        if (status) filter.status = status;

        const [shipments, total] = await Promise.all([
            Shipment.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 })
                .populate('userId', 'name email'),
            Shipment.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: shipments,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── User CRUD ───────────────────────────────────────────────────────────────

export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, phone } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'name, email, password, and role are required' });
        }
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(409).json({ success: false, message: 'A user with this email already exists' });

        const user = await User.create({ name, email, password, role, phone, isActive: true });
        const userObj = user.toObject() as any;
        delete userObj.password;
        res.status(201).json({ success: true, data: userObj });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { name, email, role, phone } = req.body;
        const updates: any = {};
        if (name)  updates.name  = name;
        if (email) updates.email = email.toLowerCase();
        if (role)  updates.role  = role;
        if (phone !== undefined) updates.phone = phone;

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({ success: true, data: user, message: `User ${user.isActive ? 'activated' : 'suspended'} successfully` });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, message: 'User permanently deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};



