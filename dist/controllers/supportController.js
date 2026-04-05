"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchShipmentForSupport = exports.getSupportDashboard = void 0;
const Shipment_1 = __importDefault(require("../models/Shipment"));
const ShipmentEvent_1 = __importDefault(require("../models/ShipmentEvent"));
const getSupportDashboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Support agents can see aggregate metrics but no financial data
        const [total, inTransit, delivered, failed] = await Promise.all([
            Shipment_1.default.countDocuments(),
            Shipment_1.default.countDocuments({ status: { $in: ['in_transit', 'at_destination_hub', 'out_for_delivery'] } }),
            Shipment_1.default.countDocuments({ status: 'delivered' }),
            Shipment_1.default.countDocuments({ status: 'delivery_failed' }),
        ]);
        // Recent events for activity feed
        const recentActivity = await ShipmentEvent_1.default.find()
            .sort({ timestamp: -1 })
            .limit(10)
            .populate('shipmentId', 'trackingNumber receiver status')
            .populate('actor', 'name role');
        res.status(200).json({
            success: true,
            data: {
                stats: { total, inTransit, delivered, failed },
                recentActivity
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSupportDashboard = getSupportDashboard;
const searchShipmentForSupport = async (req, res) => {
    try {
        const query = (req.query.q || '').trim();
        if (!query)
            return res.status(400).json({ success: false, message: 'Search query required' });
        // Read-only search — no financial fields returned
        const shipments = await Shipment_1.default.find({
            $or: [
                { trackingNumber: { $regex: query, $options: 'i' } },
                { 'receiver.name': { $regex: query, $options: 'i' } },
                { 'receiver.phone': { $regex: query, $options: 'i' } },
                { 'sender.name': { $regex: query, $options: 'i' } },
            ]
        })
            .select('-shippingCost -codAmount -codStatus') // hide financial fields from support
            .populate('userId', 'name email')
            .limit(10);
        // Fetch events for each shipment
        const results = await Promise.all(shipments.map(async (s) => {
            const events = await ShipmentEvent_1.default.find({ shipmentId: s._id })
                .sort({ timestamp: 1 })
                .populate('actor', 'name role');
            return { ...s.toObject(), events };
        }));
        res.status(200).json({ success: true, data: results });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.searchShipmentForSupport = searchShipmentForSupport;
