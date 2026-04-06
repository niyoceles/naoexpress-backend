import mongoose, { Schema, Document } from 'mongoose';

export enum ComplaintStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed'
}

export enum ComplaintPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
}

export interface IComplaint extends Document {
    subject: string;
    description: string;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    userId?: mongoose.Types.ObjectId;
    guestEmail?: string;
    guestPhone?: string;
    shipmentId?: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    responses: Array<{
        user: mongoose.Types.ObjectId;
        message: string;
        timestamp: Date;
    }>;
}

const ComplaintSchema: Schema = new Schema({
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: Object.values(ComplaintStatus), default: ComplaintStatus.OPEN },
    priority: { type: String, enum: Object.values(ComplaintPriority), default: ComplaintPriority.MEDIUM },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    guestEmail: { type: String },
    guestPhone: { type: String },
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    responses: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
