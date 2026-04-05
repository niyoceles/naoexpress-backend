import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
    COURIER = 'courier',
    WAREHOUSE_OP = 'warehouse_op',
    SUPPORT = 'support'
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    orgId?: mongoose.Types.ObjectId;
    phone?: string;
    avatar?: string;
    isActive: boolean;
    lastLogin?: Date;
    walletBalance: number;
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER },
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    phone: { type: String },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    walletBalance: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(this: any) {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
