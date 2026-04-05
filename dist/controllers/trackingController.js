"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackByNumber = void 0;
const Shipment_1 = __importDefault(require("../models/Shipment"));
const ShipmentEvent_1 = __importDefault(require("../models/ShipmentEvent"));
const trackByNumber = async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        const shipment = await Shipment_1.default.findOne({ trackingNumber })
            .select('trackingNumber sender.city sender.country receiver.city receiver.country status estimatedDelivery');
        if (!shipment) {
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        }
        const events = await ShipmentEvent_1.default.find({ shipmentId: shipment._id })
            .sort({ timestamp: -1 })
            .select('status location description timestamp');
        res.status(200).json({
            success: true,
            data: {
                shipment,
                events
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.trackByNumber = trackByNumber;
