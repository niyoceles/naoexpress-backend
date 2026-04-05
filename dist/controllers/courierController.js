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
exports.getCourierCompletedDeliveries = exports.getCourierAnalytics = void 0;
const Shipment_1 = __importStar(require("../models/Shipment"));
const ShipmentEvent_1 = __importDefault(require("../models/ShipmentEvent"));
const getCourierAnalytics = async (req, res) => {
    try {
        const courierId = req.user._id;
        const isAdmin = req.user.role === 'admin';
        // Find shipments where this courier logged the most recent event
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [outForDelivery, completedToday, failedToday] = await Promise.all([
            Shipment_1.default.countDocuments({ status: Shipment_1.ShipmentStatus.OUT_FOR_DELIVERY }),
            ShipmentEvent_1.default.countDocuments({
                ...(isAdmin ? {} : { actor: courierId }),
                status: Shipment_1.ShipmentStatus.DELIVERED,
                timestamp: { $gte: today }
            }),
            ShipmentEvent_1.default.countDocuments({
                ...(isAdmin ? {} : { actor: courierId }),
                status: Shipment_1.ShipmentStatus.DELIVERY_FAILED,
                timestamp: { $gte: today }
            })
        ]);
        // Get active deliveries (all OUT_FOR_DELIVERY shipments)
        const activeDeliveries = await Shipment_1.default.find({ status: Shipment_1.ShipmentStatus.OUT_FOR_DELIVERY })
            .sort({ updatedAt: 1 })
            .select('trackingNumber status receiver paymentType codAmount codStatus type')
            .limit(20);
        res.status(200).json({
            success: true,
            data: {
                stats: {
                    outForDelivery,
                    completedToday,
                    failedToday,
                    pendingPickup: await Shipment_1.default.countDocuments({ status: Shipment_1.ShipmentStatus.PICKUP_SCHEDULED })
                },
                activeDeliveries
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCourierAnalytics = getCourierAnalytics;
const getCourierCompletedDeliveries = async (req, res) => {
    try {
        const courierId = req.user._id;
        // Shipments where this courier logged the DELIVERED event
        const deliveredEvents = await ShipmentEvent_1.default.find({
            actor: courierId,
            status: Shipment_1.ShipmentStatus.DELIVERED
        }).sort({ timestamp: -1 }).limit(30).populate('shipmentId');
        res.status(200).json({ success: true, data: deliveredEvents });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCourierCompletedDeliveries = getCourierCompletedDeliveries;
