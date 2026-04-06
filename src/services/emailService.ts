import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create a reusable transporter using the default SMTP transport
// Since I don't have the user's SMTP credentials, I'll log to console for now
// and use environmental variables if they exists.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || 'test@example.com',
        pass: process.env.SMTP_PASS || 'password',
    },
});

export const sendNotificationEmail = async (subject: string, html: string) => {
    const mailOptions = {
        from: `"NAO Express Alerts" <${process.env.SMTP_USER || 'alerts@naoexpress.com'}>`,
        to: 'niyoceles3@gmail.com',
        subject: subject,
        html: html,
    };

    try {
        if (!process.env.SMTP_HOST) {
            console.log('--- EMAIL NOTIFICATION (MOCKED) ---');
            console.log(`To: niyoceles3@gmail.com`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${html}`);
            console.log('--- END EMAIL NOTIFICATION ---');
            return true;
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

export const notifyNewContact = async (contact: any) => {
    const html = `
        <h3>New Contact Us Message</h3>
        <p><strong>From:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone}</p>
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${contact.message}</p>
        <p><a href="${process.env.ADMIN_URL || 'http://localhost:5173'}/ops/support/contacts">View in Admin Portal</a></p>
    `;
    return sendNotificationEmail(`New Contact Inquiry: ${contact.subject}`, html);
};

export const notifyNewComplaint = async (complaint: any) => {
    const html = `
        <h3>New Issue Reported</h3>
        <p><strong>From:</strong> ${complaint.guestEmail || 'Registered User'}</p>
        <p><strong>Subject:</strong> ${complaint.subject}</p>
        <p><strong>Priority:</strong> ${complaint.priority}</p>
        <p><strong>Description:</strong></p>
        <p>${complaint.description}</p>
        <p><a href="${process.env.ADMIN_URL || 'http://localhost:5173'}/ops/support/complaints">View in Admin Portal</a></p>
    `;
    return sendNotificationEmail(`Urgent: New Issue Reported - ${complaint.subject}`, html);
};
