import { Request, Response } from 'express';
import Shipment, { ShipmentStatus } from '../models/Shipment';
import ShipmentEvent from '../models/ShipmentEvent';

export const getCourierAnalytics = async (req: any, res: Response) => {
    try {
        const courierId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        // Find shipments where this courier logged the most recent event
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [outForDelivery, completedToday, failedToday] = await Promise.all([
            Shipment.countDocuments({ status: ShipmentStatus.OUT_FOR_DELIVERY }),
            ShipmentEvent.countDocuments({
                ...(isAdmin ? {} : { actor: courierId }),
                status: ShipmentStatus.DELIVERED,
                timestamp: { $gte: today }
            }),
            ShipmentEvent.countDocuments({
                ...(isAdmin ? {} : { actor: courierId }),
                status: ShipmentStatus.DELIVERY_FAILED,
                timestamp: { $gte: today }
            })
        ]);

        // Get active deliveries (all OUT_FOR_DELIVERY shipments)
        const activeDeliveries = await Shipment.find({ status: ShipmentStatus.OUT_FOR_DELIVERY })
            .sort({ updatedAt: 1 })
            .select('trackingNumber status receiver paymentType codAmount codStatus type')
            .limit(20);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    outForDelivery,
                    completedToday,
                    failedToday,
                    pendingPickup: await Shipment.countDocuments({ status: ShipmentStatus.PICKUP_SCHEDULED })
                },
                activeDeliveries
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCourierCompletedDeliveries = async (req: any, res: Response) => {
    try {
        const courierId = req.user._id;
        
        // Shipments where this courier logged the DELIVERED event
        const deliveredEvents = await ShipmentEvent.find({
            actor: courierId,
            status: ShipmentStatus.DELIVERED
        }).sort({ timestamp: -1 }).limit(30).populate('shipmentId');

        res.status(200).json({ success: true, data: deliveredEvents });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
