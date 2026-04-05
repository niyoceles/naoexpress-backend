import { Request, Response } from 'express';
import Shipment from '../models/Shipment';
import ShipmentEvent from '../models/ShipmentEvent';

export const getSupportDashboard = async (req: any, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Support agents can see aggregate metrics but no financial data
        const [total, inTransit, delivered, failed] = await Promise.all([
            Shipment.countDocuments(),
            Shipment.countDocuments({ status: { $in: ['in_transit', 'at_destination_hub', 'out_for_delivery'] } }),
            Shipment.countDocuments({ status: 'delivered' }),
            Shipment.countDocuments({ status: 'delivery_failed' }),
        ]);

        // Recent events for activity feed
        const recentActivity = await ShipmentEvent.find()
            .sort({ timestamp: -1 })
            .limit(10)
            .populate('shipmentId', 'trackingNumber receiver status')
            .populate('actor', 'name role');

        res.status(200).json({
            success: true,
            data: {
                stats: { total, inTransit, delivered, failed },
                recentActivity
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const searchShipmentForSupport = async (req: any, res: Response) => {
    try {
        const query = (req.query.q as string || '').trim();
        if (!query) return res.status(400).json({ success: false, message: 'Search query required' });

        // Read-only search — no financial fields returned
        const shipments = await Shipment.find({
            $or: [
                { trackingNumber: { $regex: query, $options: 'i' } },
                { 'receiver.name': { $regex: query, $options: 'i' } },
                { 'receiver.phone': { $regex: query, $options: 'i' } },
                { 'sender.name': { $regex: query, $options: 'i' } },
            ]
        })
        .select('-shippingCost -codAmount -codStatus') // hide financial fields from support
        .populate('userId', 'name email')
        .limit(10);

        // Fetch events for each shipment
        const results = await Promise.all(
            shipments.map(async (s) => {
                const events = await ShipmentEvent.find({ shipmentId: s._id })
                    .sort({ timestamp: 1 })
                    .populate('actor', 'name role');
                return { ...s.toObject(), events };
            })
        );

        res.status(200).json({ success: true, data: results });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
