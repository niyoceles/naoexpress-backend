"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWarehouseById = exports.getWarehouses = exports.createWarehouse = void 0;
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
const createWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse_1.default.create(req.body);
        res.status(201).json({ success: true, data: warehouse });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createWarehouse = createWarehouse;
const getWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse_1.default.find().populate('manager', 'name email');
        res.status(200).json({ success: true, count: warehouses.length, data: warehouses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWarehouses = getWarehouses;
const getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse_1.default.findById(req.params.id);
        if (!warehouse)
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        res.status(200).json({ success: true, data: warehouse });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWarehouseById = getWarehouseById;
