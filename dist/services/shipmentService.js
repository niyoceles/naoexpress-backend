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
exports.updateShipmentStatus = exports.createShipment = exports.generateTrackingNumber = void 0;
const Shipment_1 = __importStar(require("../models/Shipment"));
const ShipmentEvent_1 = __importDefault(require("../models/ShipmentEvent"));
const mongoose_1 = __importDefault(require("mongoose"));
const generateTrackingNumber = () => {
    const prefix = 'RX';
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${year}-${random}`;
};
exports.generateTrackingNumber = generateTrackingNumber;
const createShipment = async (shipmentData) => {
    const trackingNumber = (0, exports.generateTrackingNumber)();
    const shipment = await Shipment_1.default.create({
        ...shipmentData,
        trackingNumber,
        status: Shipment_1.ShipmentStatus.DRAFT
    });
    // Create initial event
    await ShipmentEvent_1.default.create({
        shipmentId: shipment._id,
        status: Shipment_1.ShipmentStatus.DRAFT,
        location: shipment.sender.city,
        description: 'Shipment record created in system',
        actor: shipment.userId
    });
    return shipment;
};
exports.createShipment = createShipment;
const updateShipmentStatus = async (shipmentId, status, location, description, actorId) => {
    const shipment = await Shipment_1.default.findById(shipmentId);
    if (!shipment)
        throw new Error('Shipment not found');
    shipment.status = status;
    await shipment.save();
    await ShipmentEvent_1.default.create({
        shipmentId,
        status,
        location,
        description,
        actor: actorId ? new mongoose_1.default.Types.ObjectId(actorId) : undefined
    });
    return shipment;
};
exports.updateShipmentStatus = updateShipmentStatus;
