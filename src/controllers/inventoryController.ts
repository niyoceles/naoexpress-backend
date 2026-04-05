import { Request, Response } from 'express';
import InventoryItem from '../models/InventoryItem';

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
