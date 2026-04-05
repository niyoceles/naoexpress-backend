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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerAnalytics = void 0;
const Shipment_1 = __importStar(require("../models/Shipment"));
const getCustomerAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        // Query aggregations
        const [active, inTransit, delivered] = await Promise.all([
            Shipment_1.default.countDocuments({
                userId,
                status: { $nin: [Shipment_1.ShipmentStatus.DELIVERED, Shipment_1.ShipmentStatus.DELIVERY_FAILED, Shipment_1.ShipmentStatus.RETURNED] }
            }),
            Shipment_1.default.countDocuments({
                userId,
                status: { $in: [Shipment_1.ShipmentStatus.IN_TRANSIT, Shipment_1.ShipmentStatus.AT_DESTINATION_HUB, Shipment_1.ShipmentStatus.OUT_FOR_DELIVERY] }
            }),
            Shipment_1.default.countDocuments({
                userId,
                status: Shipment_1.ShipmentStatus.DELIVERED
            })
        ]);
        const revenueAgg = await Shipment_1.default.aggregate([
            { $match: { userId } },
            { $group: { _id: null, total: { $sum: '$shippingCost' } } }
        ]);
        const totalSpent = revenueAgg[0]?.total || 0;
        // Fetch recent shipments dynamically
        const recentShipments = await Shipment_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('trackingNumber status type receiver createdAt');
        res.status(200).json({
            success: true,
            data: {
                metrics: { active, inTransit, delivered, totalSpent },
                recentShipments
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCustomerAnalytics = getCustomerAnalytics;
