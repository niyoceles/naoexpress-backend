import Shipment, { IShipment, ShipmentStatus } from '../models/Shipment';
import ShipmentEvent from '../models/ShipmentEvent';
import User from '../models/User';
import mongoose from 'mongoose';

export const generateTrackingNumber = () => {
    const prefix = 'RX';
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${year}-${random}`;
};

export const createShipment = async (shipmentData: Partial<IShipment>) => {
    const trackingNumber = generateTrackingNumber();
    const shipment = await Shipment.create({
        ...shipmentData,
        trackingNumber,
        status: ShipmentStatus.DRAFT
    });

    // Create initial event
    await ShipmentEvent.create({
        shipmentId: shipment._id,
        status: ShipmentStatus.DRAFT,
        location: shipment.sender.city,
        description: 'Shipment record created in system',
        actor: shipment.userId
    });

    return shipment;
};

export const updateShipmentStatus = async (
    shipmentId: string, 
    status: ShipmentStatus, 
    location: string, 
    description: string, 
    actorId?: string
) => {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) throw new Error('Shipment not found');

    shipment.status = status;

    await shipment.save();

    await ShipmentEvent.create({
        shipmentId,
        status,
        location,
        description,
        actor: actorId ? new mongoose.Types.ObjectId(actorId) : undefined
    });

    return shipment;
};
