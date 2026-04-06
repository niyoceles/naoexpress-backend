import { Request, Response } from 'express';
import Contact from '../models/Contact';
import { notifyNewContact } from '../services/emailService';

export const createContact = async (req: Request, res: Response) => {
    try {
        const { email, phone, subject, message } = req.body;

        if (!email || !phone || !subject || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const contact = await Contact.create({
            email,
            phone,
            subject,
            message
        });

        // Notify support email
        await notifyNewContact(contact);

        res.status(201).json({ 
            success: true, 
            message: 'Your message has been received. Our team will get back to you shortly.',
            data: contact 
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllContacts = async (req: Request, res: Response) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: contacts });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateContactStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!contact) return res.status(404).json({ success: false, message: 'Contact record not found' });

        res.status(200).json({ success: true, data: contact });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
