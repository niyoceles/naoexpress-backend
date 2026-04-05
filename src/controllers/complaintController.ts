import { Request, Response } from 'express';
import Complaint, { ComplaintStatus } from '../models/Complaint';

export const createComplaint = async (req: any, res: Response) => {
    try {
        const { subject, description, shipmentId, priority } = req.body;
        const complaint = await Complaint.create({
            subject,
            description,
            shipmentId: shipmentId || null,
            priority: priority || 'medium',
            userId: req.user._id
        });

        res.status(201).json({ success: true, data: complaint });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyComplaints = async (req: any, res: Response) => {
    try {
        const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: complaints });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllComplaints = async (req: Request, res: Response) => {
    try {
        const complaints = await Complaint.find()
            .populate('userId', 'name email phone')
            .populate('shipmentId', 'trackingNumber')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: complaints });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateComplaintStatus = async (req: any, res: Response) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

        res.status(200).json({ success: true, data: complaint });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const respondToComplaint = async (req: any, res: Response) => {
    try {
        const { message } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

        complaint.responses.push({
            user: req.user._id,
            message,
            timestamp: new Date()
        });

        // Auto-set status to 'in_progress' if role is admin/support
        if (req.user.role !== 'customer') {
            complaint.status = ComplaintStatus.IN_PROGRESS;
        }

        await complaint.save();

        res.status(200).json({ success: true, data: complaint });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
