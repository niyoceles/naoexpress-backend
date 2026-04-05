import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
    name: string;
    type: 'merchant' | 'partner' | 'internal';
    contactEmail: string;
    contactPhone: string;
    address: string;
    logo?: string;
    isActive: boolean;
    settings: {
        autoPickup: boolean;
        customRateCard?: mongoose.Types.ObjectId;
    };
}

const OrganizationSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['merchant', 'partner', 'internal'], default: 'merchant' },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    address: { type: String, required: true },
    logo: { type: String },
    isActive: { type: Boolean, default: true },
    settings: {
        autoPickup: { type: Boolean, default: false },
        customRateCard: { type: Schema.Types.ObjectId, ref: 'RateCard' }
    }
}, {
    timestamps: true
});

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
