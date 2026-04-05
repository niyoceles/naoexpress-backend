"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStockLevel = exports.stockIn = exports.getSKUs = void 0;
const InventoryItem_1 = __importDefault(require("../models/InventoryItem"));
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
