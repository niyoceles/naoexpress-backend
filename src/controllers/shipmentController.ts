import { Request, Response } from 'express';
import Shipment, { ShipmentStatus } from '../models/Shipment';
import ShipmentEvent from '../models/ShipmentEvent';
import { createShipment, updateShipmentStatus } from '../services/shipmentService';

export const createNewShipment = async (req: any, res: Response) => {
    try {
        const shipment = await createShipment({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json({ success: true, data: shipment });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyShipments = async (req: any, res: Response) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
        const shipments = await Shipment.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: shipments.length, data: shipments });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getShipmentById = async (req: any, res: Response) => {
    try {
        const shipment = await Shipment.findById(req.params.id);
        if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
        
        // Authorization check
        if (shipment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to access this shipment' });
        }

        const events = await ShipmentEvent.find({ shipmentId: shipment._id }).sort({ timestamp: -1 });

        res.status(200).json({ success: true, data: { ...shipment.toObject(), events } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateStatus = async (req: any, res: Response) => {
    try {
        const { status, location, description } = req.body;
        const shipment = await updateShipmentStatus(
            req.params.id,
            status as ShipmentStatus,
            location,
            description,
            req.user._id
        );
        res.status(200).json({ success: true, data: shipment });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const bulkCreateShipments = async (req: any, res: Response) => {
    try {
        const shipmentsData = req.body.shipments as any[];
        if (!shipmentsData || !Array.isArray(shipmentsData)) {
            return res.status(400).json({ success: false, message: 'Invalid shipments data' });
        }

        const results = await Promise.all(
            shipmentsData.map(async (data: any) => {
                return await createShipment({
                    ...data,
                    userId: req.user._id
                });
            })
        );

        res.status(201).json({ success: true, count: results.length, data: results });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateShipmentDetails = async (req: any, res: Response) => {
    try {
        const { sender, receiver } = req.body;
        const shipment = await Shipment.findById(req.params.id);
        if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

        if (sender) {
            shipment.sender = { ...shipment.sender, ...sender };
        }
        if (receiver) {
            shipment.receiver = { ...shipment.receiver, ...receiver };
        }

        await shipment.save();
        res.status(200).json({ success: true, data: shipment });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
