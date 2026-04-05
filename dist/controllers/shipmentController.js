"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShipmentDetails = exports.bulkCreateShipments = exports.updateStatus = exports.getShipmentById = exports.getMyShipments = exports.createNewShipment = void 0;
const Shipment_1 = __importDefault(require("../models/Shipment"));
const ShipmentEvent_1 = __importDefault(require("../models/ShipmentEvent"));
const shipmentService_1 = require("../services/shipmentService");
const createNewShipment = async (req, res) => {
    try {
        const shipment = await (0, shipmentService_1.createShipment)({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json({ success: true, data: shipment });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createNewShipment = createNewShipment;
const getMyShipments = async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
        const shipments = await Shipment_1.default.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: shipments.length, data: shipments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyShipments = getMyShipments;
const getShipmentById = async (req, res) => {
    try {
        const shipment = await Shipment_1.default.findById(req.params.id);
        if (!shipment)
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        // Authorization check
        if (shipment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to access this shipment' });
        }
        const events = await ShipmentEvent_1.default.find({ shipmentId: shipment._id }).sort({ timestamp: -1 });
        res.status(200).json({ success: true, data: { ...shipment.toObject(), events } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getShipmentById = getShipmentById;
const updateStatus = async (req, res) => {
    try {
        const { status, location, description } = req.body;
        const shipment = await (0, shipmentService_1.updateShipmentStatus)(req.params.id, status, location, description, req.user._id);
        res.status(200).json({ success: true, data: shipment });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateStatus = updateStatus;
const bulkCreateShipments = async (req, res) => {
    try {
        const shipmentsData = req.body.shipments;
        if (!shipmentsData || !Array.isArray(shipmentsData)) {
            return res.status(400).json({ success: false, message: 'Invalid shipments data' });
        }
        const results = await Promise.all(shipmentsData.map(async (data) => {
            return await (0, shipmentService_1.createShipment)({
                ...data,
                userId: req.user._id
            });
        }));
        res.status(201).json({ success: true, count: results.length, data: results });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.bulkCreateShipments = bulkCreateShipments;
const updateShipmentDetails = async (req, res) => {
    try {
        const { sender, receiver } = req.body;
        const shipment = await Shipment_1.default.findById(req.params.id);
        if (!shipment)
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        if (sender) {
            shipment.sender = { ...shipment.sender, ...sender };
        }
        if (receiver) {
            shipment.receiver = { ...shipment.receiver, ...receiver };
        }
        await shipment.save();
        res.status(200).json({ success: true, data: shipment });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateShipmentDetails = updateShipmentDetails;
