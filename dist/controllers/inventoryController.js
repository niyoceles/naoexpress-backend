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
exports.createProduct = exports.dispatchInventory = exports.updateStockLevel = exports.stockIn = exports.getSKUs = void 0;
const InventoryItem_1 = __importDefault(require("../models/InventoryItem"));
const Shipment_1 = __importStar(require("../models/Shipment"));
const shipmentService_1 = require("../services/shipmentService");
const getSKUs = async (req, res) => {
    try {
        const skus = await InventoryItem_1.default.find().populate('warehouseId', 'name code');
        res.status(200).json({ success: true, data: skus });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSKUs = getSKUs;
const stockIn = async (req, res) => {
    try {
        const { sku, name, quantity, warehouseId, binLocation, zone, description } = req.body;
        // Find existing or create new SKU entry
        let item = await InventoryItem_1.default.findOne({ sku });
        if (item) {
            item.quantity += Number(quantity);
            if (item.quantity > 0)
                item.status = 'in_stock';
            await item.save();
        }
        else {
            item = await InventoryItem_1.default.create({
                sku, name, quantity, warehouseId, binLocation, zone, description
            });
        }
        res.status(201).json({ success: true, data: item });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.stockIn = stockIn;
const updateStockLevel = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const item = await InventoryItem_1.default.findByIdAndUpdate(id, { quantity }, { new: true });
        if (!item)
            return res.status(404).json({ success: false, message: 'Item not found' });
        res.status(200).json({ success: true, data: item });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateStockLevel = updateStockLevel;
const dispatchInventory = async (req, res) => {
    try {
        const { skuId, quantity, sender, receiver, type, totalWeight, assignedTo, paymentType } = req.body;
        const item = await InventoryItem_1.default.findById(skuId);
        if (!item)
            return res.status(404).json({ success: false, message: 'Inventory item not found' });
        if (item.quantity < Number(quantity)) {
            return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${item.quantity}` });
        }
        const shipment = await Shipment_1.default.create({
            trackingNumber: (0, shipmentService_1.generateTrackingNumber)(),
            sender,
            receiver,
            totalWeight: totalWeight || Number(quantity) * 0.5,
            shippingCost: 0,
            type: type || 'domestic',
            userId: req.user._id,
            assignedTo: assignedTo || req.user._id,
            status: Shipment_1.ShipmentStatus.DISPATCHED,
            paymentType: paymentType || 'prepaid',
            items: [{ skuId, quantity: Number(quantity) }],
            parcels: [{
                    weight: totalWeight || 1,
                    dimensions: { length: 10, width: 10, height: 10 },
                    description: `Inventory Dispatch: ${item.name}`,
                    declaredValue: 0
                }]
        });
        item.quantity -= Number(quantity);
        if (item.quantity === 0)
            item.status = 'out_of_stock';
        else if (item.quantity <= 10)
            item.status = 'low_stock';
        await item.save();
        res.status(201).json({
            success: true,
            data: shipment,
            message: `Dispatched ${quantity} units of ${item.name}`
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.dispatchInventory = dispatchInventory;
const createProduct = async (req, res) => {
    try {
        const { sku, name, description, warehouseId, binLocation, zone, quantity } = req.body;
        const existing = await InventoryItem_1.default.findOne({ sku });
        if (existing)
            return res.status(400).json({ success: false, message: 'SKU already exists' });
        const item = await InventoryItem_1.default.create({
            sku, name, description, warehouseId, binLocation, zone, quantity: quantity || 0
        });
        res.status(201).json({ success: true, data: item });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createProduct = createProduct;
