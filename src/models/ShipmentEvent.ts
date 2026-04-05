import mongoose, { Schema, Document } from 'mongoose';
import { ShipmentStatus } from './Shipment';

export interface IShipmentEvent extends Document {
    shipmentId: mongoose.Types.ObjectId;
    status: ShipmentStatus;
    location: string;
    description: string;
    actor?: mongoose.Types.ObjectId;
    timestamp: Date;
    metadata?: Record<string, any>;
}

const ShipmentEventSchema: Schema = new Schema({
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    status: { type: String, enum: Object.values(ShipmentStatus), required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Map, of: Schema.Types.Mixed }
}, {
    timestamps: true
});

// Compound index for chronological tracking
ShipmentEventSchema.index({ shipmentId: 1, timestamp: -1 });

export default mongoose.model<IShipmentEvent>('ShipmentEvent', ShipmentEventSchema);
