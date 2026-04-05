"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.toggleUserStatus = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllShipments = exports.getAllUsers = exports.getAnalyticsOverview = void 0;
const User_1 = __importDefault(require("../models/User"));
const Shipment_1 = __importStar(require("../models/Shipment"));
const getAnalyticsOverview = async (req, res) => {
    try {
        const [totalShipments, delivered, failed, users] = await Promise.all([
            Shipment_1.default.countDocuments(),
            Shipment_1.default.countDocuments({ status: Shipment_1.ShipmentStatus.DELIVERED }),
            Shipment_1.default.countDocuments({ status: Shipment_1.ShipmentStatus.DELIVERY_FAILED }),
            User_1.default.countDocuments()
        ]);
        const pending = await Shipment_1.default.countDocuments({
            status: { $in: [Shipment_1.ShipmentStatus.PENDING_PAYMENT, Shipment_1.ShipmentStatus.PICKUP_SCHEDULED, Shipment_1.ShipmentStatus.DRAFT] }
        });
        const inTransit = await Shipment_1.default.countDocuments({
            status: { $in: [Shipment_1.ShipmentStatus.IN_TRANSIT, Shipment_1.ShipmentStatus.AT_DESTINATION_HUB, Shipment_1.ShipmentStatus.OUT_FOR_DELIVERY] }
        });
        const deliveryRate = totalShipments > 0
            ? ((delivered / totalShipments) * 100).toFixed(1)
            : '0';
        // Revenue estimate (sum of shippingCost on delivered shipments)
        const revenueAgg = await Shipment_1.default.aggregate([
            { $match: { status: Shipment_1.ShipmentStatus.DELIVERED } },
            { $group: { _id: null, total: { $sum: '$shippingCost' } } }
        ]);
        const estimatedRevenue = revenueAgg[0]?.total || 0;
        // Top destinations
        const topDestinations = await Shipment_1.default.aggregate([
            { $group: { _id: '$receiver.country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        // Generate 7-day chart data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const chartAgg = await Shipment_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAnalyticsOverview = getAnalyticsOverview;
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const role = req.query.role;
        const search = req.query.search;
        const filter = {};
        if (role)
            filter.role = role;
        if (search && search.trim()) {
            const regex = { $regex: search.trim(), $options: 'i' };
            filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
        }
        const [users, total] = await Promise.all([
            User_1.default.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            User_1.default.countDocuments(filter)
        ]);
        res.status(200).json({
            success: true,
            data: users,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllUsers = getAllUsers;
const getAllShipments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const filter = {};
        if (status)
            filter.status = status;
        const [shipments, total] = await Promise.all([
            Shipment_1.default.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 })
                .populate('userId', 'name email'),
            Shipment_1.default.countDocuments(filter)
        ]);
        res.status(200).json({
            success: true,
            data: shipments,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllShipments = getAllShipments;
// ─── User CRUD ───────────────────────────────────────────────────────────────
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'name, email, password, and role are required' });
        }
        const existing = await User_1.default.findOne({ email: email.toLowerCase() });
        if (existing)
            return res.status(409).json({ success: false, message: 'A user with this email already exists' });
        const user = await User_1.default.create({ name, email, password, role, phone, isActive: true });
        const userObj = user.toObject();
        delete userObj.password;
        res.status(201).json({ success: true, data: userObj });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const { name, email, role, phone } = req.body;
        const updates = {};
        if (name)
            updates.name = name;
        if (email)
            updates.email = email.toLowerCase();
        if (role)
            updates.role = role;
        if (phone !== undefined)
            updates.phone = phone;
        const user = await User_1.default.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateUser = updateUser;
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({ success: true, data: user, message: `User ${user.isActive ? 'activated' : 'suspended'} successfully` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.toggleUserStatus = toggleUserStatus;
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndDelete(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, message: 'User permanently deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteUser = deleteUser;
