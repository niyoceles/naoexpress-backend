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
exports.assignShipment = exports.getWarehouseAnalytics = void 0;
const Shipment_1 = __importStar(require("../models/Shipment"));
const User_1 = require("../models/User");
const getWarehouseAnalytics = async (req, res) => {
    try {
        const { role, _id: userId } = req.user;
        const isAdmin = role === User_1.UserRole.ADMIN;
        // Base filters for counts
        const baseFilter = isAdmin ? {} : { assignedTo: userId };
        const [atOriginHub, atDestHub, inTransit, outForDelivery, dispatched] = await Promise.all([
            Shipment_1.default.countDocuments({ ...baseFilter, status: Shipment_1.ShipmentStatus.AT_ORIGIN_HUB }),
            Shipment_1.default.countDocuments({ ...baseFilter, status: Shipment_1.ShipmentStatus.AT_DESTINATION_HUB }),
            Shipment_1.default.countDocuments({ ...baseFilter, status: Shipment_1.ShipmentStatus.IN_TRANSIT }),
            Shipment_1.default.countDocuments({ ...baseFilter, status: Shipment_1.ShipmentStatus.OUT_FOR_DELIVERY }),
            Shipment_1.default.countDocuments({ ...baseFilter, status: Shipment_1.ShipmentStatus.DISPATCHED }),
        ]);
        // Incoming: packages that arrived at hub and need sorting
        const incomingFilter = {
            status: { $in: [Shipment_1.ShipmentStatus.AT_ORIGIN_HUB, Shipment_1.ShipmentStatus.PICKED_UP] }
        };
        if (!isAdmin)
            incomingFilter.assignedTo = userId;
        const incomingQueue = await Shipment_1.default.find(incomingFilter)
            .sort({ updatedAt: 1 })
            .select('trackingNumber status sender receiver type totalWeight assignedTo')
            .populate('assignedTo', 'name email')
            .limit(30);
        // Outgoing: packages ready to move to destination hub or courier
        const outgoingFilter = {
            status: { $in: [Shipment_1.ShipmentStatus.AT_DESTINATION_HUB, Shipment_1.ShipmentStatus.IN_TRANSIT, Shipment_1.ShipmentStatus.DISPATCHED] }
        };
        if (!isAdmin)
            outgoingFilter.assignedTo = userId;
        const outgoingQueue = await Shipment_1.default.find(outgoingFilter)
            .sort({ updatedAt: 1 })
            .select('trackingNumber status sender receiver type totalWeight assignedTo')
            .populate('assignedTo', 'name email')
            .limit(30);
        res.status(200).json({
            success: true,
            data: {
                stats: { atOriginHub, atDestHub, inTransit, outForDelivery, dispatched },
                incomingQueue,
                outgoingQueue,
                isFiltered: !isAdmin
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWarehouseAnalytics = getWarehouseAnalytics;
const assignShipment = async (req, res) => {
    try {
        const { id } = req.params; // shipmentId
        const { assignedTo } = req.body; // userId
        const shipment = await Shipment_1.default.findByIdAndUpdate(id, { assignedTo }, { new: true }).populate('assignedTo', 'name email');
        if (!shipment) {
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        }
        res.status(200).json({
            success: true,
            data: shipment,
            message: 'Shipment assigned successfully'
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.assignShipment = assignShipment;
