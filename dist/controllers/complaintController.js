"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToComplaint = exports.updateComplaintStatus = exports.getAllComplaints = exports.getMyComplaints = exports.createComplaint = void 0;
const Complaint_1 = __importStar(require("../models/Complaint"));
const createComplaint = async (req, res) => {
    try {
        const { subject, description, shipmentId, priority } = req.body;
        const complaint = await Complaint_1.default.create({
            subject,
            description,
            shipmentId: shipmentId || null,
            priority: priority || 'medium',
            userId: req.user._id
        });
        res.status(201).json({ success: true, data: complaint });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createComplaint = createComplaint;
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint_1.default.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: complaints });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyComplaints = getMyComplaints;
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint_1.default.find()
            .populate('userId', 'name email phone')
            .populate('shipmentId', 'trackingNumber')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: complaints });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllComplaints = getAllComplaints;
const updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!complaint)
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        res.status(200).json({ success: true, data: complaint });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateComplaintStatus = updateComplaintStatus;
const respondToComplaint = async (req, res) => {
    try {
        const { message } = req.body;
        const complaint = await Complaint_1.default.findById(req.params.id);
        if (!complaint)
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        complaint.responses.push({
            user: req.user._id,
            message,
            timestamp: new Date()
        });
        // Auto-set status to 'in_progress' if role is admin/support
        if (req.user.role !== 'customer') {
            complaint.status = Complaint_1.ComplaintStatus.IN_PROGRESS;
        }
        await complaint.save();
        res.status(200).json({ success: true, data: complaint });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.respondToComplaint = respondToComplaint;
