import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
    sku: string;
    name: string;
    description?: string;
    quantity: number;
    warehouseId: mongoose.Types.ObjectId;
    zone: string;
    binLocation: string;
    status: 'in_stock' | 'reserved' | 'low_stock' | 'out_of_stock';
}

const InventoryItemSchema: Schema = new Schema({
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    zone: { type: String, default: 'A' },
    binLocation: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['in_stock', 'reserved', 'low_stock', 'out_of_stock'], 
        default: 'in_stock' 
    }
}, {
    timestamps: true
});

export default mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);
