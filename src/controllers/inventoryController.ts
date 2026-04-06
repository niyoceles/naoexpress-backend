import { Request, Response } from 'express';
import InventoryItem from '../models/InventoryItem';
import Shipment, { ShipmentStatus } from '../models/Shipment';
import { generateTrackingNumber } from '../services/shipmentService';

export const getSKUs = async (req: Request, res: Response) => {
    try {
        const skus = await InventoryItem.find().populate('warehouseId', 'name code');
        res.status(200).json({ success: true, data: skus });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const stockIn = async (req: Request, res: Response) => {
    try {
        const { sku, name, quantity, warehouseId, binLocation, zone, description } = req.body;
        
        // Find existing or create new SKU entry
        let item = await InventoryItem.findOne({ sku });
        
        if (item) {
            item.quantity += Number(quantity);
            if (item.quantity > 0) item.status = 'in_stock';
            await item.save();
        } else {
            item = await InventoryItem.create({
                sku, name, quantity, warehouseId, binLocation, zone, description
            });
        }

        res.status(201).json({ success: true, data: item });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateStockLevel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const item = await InventoryItem.findByIdAndUpdate(id, { quantity }, { new: true });
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const dispatchInventory = async (req: any, res: Response) => {
    try {
        const { 
            skuId, quantity, sender, receiver, 
            type, totalWeight, assignedTo, paymentType 
        } = req.body;

        const item = await InventoryItem.findById(skuId);
        if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
        if (item.quantity < Number(quantity)) {
            return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${item.quantity}` });
        }

        const shipment = await Shipment.create({
            trackingNumber: generateTrackingNumber(),
            sender,
            receiver,
            totalWeight: totalWeight || Number(quantity) * 0.5,
            shippingCost: 0,
            type: type || 'domestic',
            userId: req.user._id,
            assignedTo: assignedTo || req.user._id,
            status: ShipmentStatus.DISPATCHED,
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
        if (item.quantity === 0) item.status = 'out_of_stock';
        else if (item.quantity <= 10) item.status = 'low_stock';
        await item.save();

        res.status(201).json({ 
            success: true, 
            data: shipment, 
            message: `Dispatched ${quantity} units of ${item.name}` 
        });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { sku, name, description, warehouseId, binLocation, zone, quantity } = req.body;
        
        const existing = await InventoryItem.findOne({ sku });
        if (existing) return res.status(400).json({ success: false, message: 'SKU already exists' });

        const item = await InventoryItem.create({
            sku, name, description, warehouseId, binLocation, zone, quantity: quantity || 0
        });

        res.status(201).json({ success: true, data: item });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

