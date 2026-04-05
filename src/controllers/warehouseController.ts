import { Request, Response } from 'express';
import Warehouse from '../models/Warehouse';

export const createWarehouse = async (req: Request, res: Response) => {
    try {
        const warehouse = await Warehouse.create(req.body);
        res.status(201).json({ success: true, data: warehouse });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWarehouses = async (req: Request, res: Response) => {
    try {
        const warehouses = await Warehouse.find().populate('manager', 'name email');
        res.status(200).json({ success: true, count: warehouses.length, data: warehouses });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWarehouseById = async (req: Request, res: Response) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });
        res.status(200).json({ success: true, data: warehouse });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
