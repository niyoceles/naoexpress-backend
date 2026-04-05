import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
    name: string;
    code: string;
    location: {
        address: string;
        city: string;
        country: string;
        coordinates?: { lat: number; lng: number };
    };
    manager?: mongoose.Types.ObjectId;
    zones: Array<{
        name: string;
        code: string;
        type: 'storage' | 'picking' | 'receiving' | 'shipping';
    }>;
    isActive: boolean;
}

const WarehouseSchema: Schema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    zones: [{
        name: { type: String, required: true },
        code: { type: String, required: true },
        type: { type: String, enum: ['storage', 'picking', 'receiving', 'shipping'], default: 'storage' }
    }],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);
