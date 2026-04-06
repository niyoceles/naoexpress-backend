import mongoose, { Schema, Document } from 'mongoose';

export enum ShipmentStatus {
    DRAFT = 'draft',
    QUOTE_GENERATED = 'quote_generated',
    PENDING_PAYMENT = 'pending_payment',
    PAID = 'paid',
    PICKUP_SCHEDULED = 'pickup_scheduled',
    PICKED_UP = 'picked_up',
    AT_ORIGIN_HUB = 'at_origin_hub',
    DISPATCHED = 'dispatched',
    IN_TRANSIT = 'in_transit',
    CUSTOMS_PROCESSING = 'customS_processing',
    AT_DESTINATION_HUB = 'at_destination_hub',
    OUT_FOR_DELIVERY = 'out_for_delivery',
    DELIVERED = 'delivered',
    DELIVERY_FAILED = 'delivery_failed',
    RETURNED = 'returned',
    CANCELLED = 'cancelled'
}

export interface IShipment extends Document {
    trackingNumber: string;
    sender: {
        name: string;
        email?: string;
        phone: string;
        address: string;
        city: string;
        country: string;
    };
    receiver: {
        name: string;
        email?: string;
        phone: string;
        address: string;
        city: string;
        country: string;
    };
    parcels: Array<{
        name: string;
        weight: number;
        dimensions: { length: number; width: number; height: number };
        description?: string;
        declaredValue: number;
    }>;
    status: ShipmentStatus;
    type: 'domestic' | 'international';
    totalWeight: number;
    shippingCost: number;
    currency: string;
    orgId?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    estimatedDelivery?: Date;
    paymentType: 'prepaid' | 'cod';
    codAmount: number;
    codStatus: 'pending' | 'collected' | 'remitted';
    pod?: {
        image: string;
        signature: string;
        timestamp: Date;
    };
    assignedTo?: mongoose.Types.ObjectId;
    items?: Array<{
        skuId: mongoose.Types.ObjectId;
        quantity: number;
    }>;
}

const ShipmentSchema: Schema = new Schema({
    trackingNumber: { type: String, required: true, unique: true, index: true },
    sender: {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true }
    },
    receiver: {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true }
    },
    parcels: [{
        name: { type: String, required: true },
        weight: { type: Number, required: true },
        dimensions: {
            length: { type: Number, required: true },
            width: { type: Number, required: true },
            height: { type: Number, required: true }
        },
        description: { type: String },
        declaredValue: { type: Number, default: 0 }
    }],
    status: { type: String, enum: Object.values(ShipmentStatus), default: ShipmentStatus.DRAFT },
    type: { type: String, enum: ['domestic', 'international'], default: 'domestic' },
    totalWeight: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    estimatedDelivery: { type: Date },
    paymentType: { type: String, enum: ['prepaid', 'cod'], default: 'prepaid' },
    codAmount: { type: Number, default: 0 },
    codStatus: { type: String, enum: ['pending', 'collected', 'remitted'], default: 'pending' },
    pod: {
        image: { type: String },
        signature: { type: String },
        timestamp: { type: Date }
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [{
        skuId: { type: Schema.Types.ObjectId, ref: 'InventoryItem' },
        quantity: { type: Number, required: true }
    }]
}, {
    timestamps: true
});

export default mongoose.model<IShipment>('Shipment', ShipmentSchema);
