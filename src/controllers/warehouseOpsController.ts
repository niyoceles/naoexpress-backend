import { Request, Response } from 'express';
import Shipment, { ShipmentStatus } from '../models/Shipment';
import { UserRole } from '../models/User';

export const getWarehouseAnalytics = async (req: any, res: Response) => {
    try {
        const { role, _id: userId } = req.user;
        const isAdmin = role === UserRole.ADMIN;

        // Base filters for counts
        const baseFilter: any = isAdmin ? {} : { assignedTo: userId };

        const [atOriginHub, atDestHub, inTransit, outForDelivery, dispatched] = await Promise.all([
            Shipment.countDocuments({ ...baseFilter, status: ShipmentStatus.AT_ORIGIN_HUB }),
            Shipment.countDocuments({ ...baseFilter, status: ShipmentStatus.AT_DESTINATION_HUB }),
            Shipment.countDocuments({ ...baseFilter, status: ShipmentStatus.IN_TRANSIT }),
            Shipment.countDocuments({ ...baseFilter, status: ShipmentStatus.OUT_FOR_DELIVERY }),
            Shipment.countDocuments({ ...baseFilter, status: ShipmentStatus.DISPATCHED }),
        ]);

        // Incoming: packages that arrived at hub and need sorting
        const incomingFilter: any = {
            status: { $in: [ShipmentStatus.AT_ORIGIN_HUB, ShipmentStatus.PICKED_UP] }
        };
        if (!isAdmin) incomingFilter.assignedTo = userId;

        const incomingQueue = await Shipment.find(incomingFilter)
            .sort({ updatedAt: 1 })
            .select('trackingNumber status sender receiver type totalWeight assignedTo')
            .populate('assignedTo', 'name email')
            .limit(30);

        // Outgoing: packages ready to move to destination hub or courier
        const outgoingFilter: any = {
            status: { $in: [ShipmentStatus.AT_DESTINATION_HUB, ShipmentStatus.IN_TRANSIT, ShipmentStatus.DISPATCHED] }
        };
        if (!isAdmin) outgoingFilter.assignedTo = userId;

        const outgoingQueue = await Shipment.find(outgoingFilter)
            .sort({ updatedAt: 1 })
            .select('trackingNumber status sender receiver type totalWeight assignedTo')
            .populate('assignedTo', 'name email')
            .limit(30);

        res.status(200).json({
            success: true,
            data: {
                stats: { atOriginHub, atDestHub, inTransit, outForDelivery, dispatched },
                incomingQueue,
                outgoingQueue,
                isFiltered: !isAdmin
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const assignShipment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // shipmentId
        const { assignedTo } = req.body; // userId

        const shipment = await Shipment.findByIdAndUpdate(
            id, 
            { assignedTo }, 
            { new: true }
        ).populate('assignedTo', 'name email');

        if (!shipment) {
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        }

        res.status(200).json({
            success: true,
            data: shipment,
            message: 'Shipment assigned successfully'
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
