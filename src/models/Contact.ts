import mongoose, { Schema, Document } from 'mongoose';

export enum ContactStatus {
    NEW = 'new',
    READ = 'read',
    REPLIED = 'replied'
}

export interface IContact extends Document {
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: ContactStatus;
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema: Schema = new Schema({
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: Object.values(ContactStatus), default: ContactStatus.NEW }
}, {
    timestamps: true
});

export default mongoose.model<IContact>('Contact', ContactSchema);
