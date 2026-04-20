import mongoose, { Schema, Document } from 'mongoose';

export interface IMigration extends Document {
    name: string;
    version: number;
    executedAt: Date;
}

const MigrationSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    version: { type: Number, required: true },
    executedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.model<IMigration>('Migration', MigrationSchema);
