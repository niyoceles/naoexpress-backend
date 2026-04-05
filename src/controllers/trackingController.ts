import { Request, Response } from 'express';
import Shipment from '../models/Shipment';
import ShipmentEvent from '../models/ShipmentEvent';

export const trackByNumber = async (req: Request, res: Response) => {
    try {
        const { trackingNumber } = req.params;
        const shipment = await Shipment.findOne({ trackingNumber })
            .select('trackingNumber sender.city sender.country receiver.city receiver.country status estimatedDelivery');
        
        if (!shipment) {
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        }

        const events = await ShipmentEvent.find({ shipmentId: shipment._id })
            .sort({ timestamp: -1 })
            .select('status location description timestamp');

        res.status(200).json({
            success: true,
            data: {
                shipment,
                events
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
