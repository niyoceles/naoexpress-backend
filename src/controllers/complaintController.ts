import { Request, Response } from 'express';
import Complaint, { ComplaintStatus } from '../models/Complaint';
import Shipment from '../models/Shipment';
import { notifyNewComplaint } from '../services/emailService';

export const createComplaint = async (req: any, res: Response) => {
    try {
        const { subject, description, shipmentId, trackingNumber, priority, guestEmail, guestPhone } = req.body;
        
        let finalShipmentId = shipmentId;

        // If trackingNumber is provided but no shipmentId, look it up
        if (!finalShipmentId && trackingNumber) {
            const shipment = await Shipment.findOne({ trackingNumber });
            if (shipment) {
                finalShipmentId = shipment._id;
            } else {
                return res.status(404).json({ success: false, message: 'Shipment with this tracking number not found.' });
            }
        }

        const complaintData: any = {
            subject,
            description,
            shipmentId: finalShipmentId || null,
            priority: priority || 'medium'
        };

        if (req.user) {
            complaintData.userId = req.user._id;
        } else {
            if (!guestEmail) {
                return res.status(400).json({ success: false, message: 'Email is required for guest complaints.' });
            }
            complaintData.guestEmail = guestEmail;
            complaintData.guestPhone = guestPhone;
        }

        const complaint = await Complaint.create(complaintData);

        // Send email notification
        await notifyNewComplaint(complaint);

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
