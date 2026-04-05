import { Response } from 'express';
import Shipment, { ShipmentStatus } from '../models/Shipment';

export const getCustomerAnalytics = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;

        // Query aggregations
        const [active, inTransit, delivered] = await Promise.all([
            Shipment.countDocuments({ 
                userId, 
                status: { $nin: [ShipmentStatus.DELIVERED, ShipmentStatus.DELIVERY_FAILED, ShipmentStatus.RETURNED] } 
            }),
            Shipment.countDocuments({ 
                userId, 
                status: { $in: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.AT_DESTINATION_HUB, ShipmentStatus.OUT_FOR_DELIVERY] } 
            }),
            Shipment.countDocuments({ 
                userId, 
                status: ShipmentStatus.DELIVERED 
            })
        ]);

        const revenueAgg = await Shipment.aggregate([
            { $match: { userId } },
            { $group: { _id: null, total: { $sum: '$shippingCost' } } }
        ]);
        const totalSpent = revenueAgg[0]?.total || 0;

        // Fetch recent shipments dynamically
        const recentShipments = await Shipment.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('trackingNumber status type receiver createdAt');

        res.status(200).json({
            success: true,
            data: {
                metrics: { active, inTransit, delivered, totalSpent },
                recentShipments
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
