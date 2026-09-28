import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// emailService — Unified email sender
//
// Priority:
//   1. Resend HTTP API  (RESEND_API_KEY set) — works on DigitalOcean since it
//      uses HTTPS port 443. DigitalOcean permanently blocks SMTP (25/465/587).
//   2. Nodemailer/SMTP fallback              — used in local development only.
//   3. Mock console log fallback            — when no credentials are configured.
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    bcc?: string | string[];
}

const DEFAULT_SENDER = process.env.EMAIL_FROM || 'NAO Express <onboarding@resend.dev>';
const DEFAULT_NOTIFICATION_RECIPIENT = process.env.NOTIFICATION_EMAIL || 'paradisebountyco@gmail.com';

/**
 * Core sendEmail function supporting Resend (production) and Nodemailer (local).
 */
export const sendEmail = async ({ to, subject, html, text, bcc }: EmailOptions): Promise<any> => {
    // ── 1. Resend (production / HTTPS port 443) ──────────────────────────────
    if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const payload: any = {
            from: DEFAULT_SENDER,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            text,
        };
        if (bcc) {
            payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
        }

        const { data, error } = await resend.emails.send(payload);
        if (error) {
            console.error('[emailService] Resend error:', error);
            throw new Error(error.message || 'Failed to send email via Resend');
        }
        console.log('[emailService] Email sent via Resend. id:', data?.id, 'to:', to);
        return data;
    }

    // ── 2. Nodemailer / SMTP fallback (local dev) ─────────────────────────────
    const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : undefined;
    const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : undefined;

    if (!smtpUser || !smtpPass) {
        console.log('--- EMAIL NOTIFICATION (MOCKED / NO CREDENTIALS) ---');
        console.log(`To:`, to);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${html || text}`);
        console.log('--- END EMAIL NOTIFICATION ---');
        return { mocked: true };
    }

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    const transportConfig: any = host && host !== 'smtp.gmail.com'
        ? { host, port, secure }
        : { service: 'gmail' };

    const transporter = nodemailer.createTransport({
        ...transportConfig,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });

    const info = await transporter.sendMail({
        from: `"NAO Express Alerts" <${smtpUser}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text,
        bcc,
    });

    console.log('[emailService] Email sent via SMTP. id:', info.messageId, 'to:', to);
    return info;
};

/**
 * Send notification email (preserves exact compatibility with existing codebase).
 */
export const sendNotificationEmail = async (
    subject: string,
    html: string,
    to: string = DEFAULT_NOTIFICATION_RECIPIENT
): Promise<boolean> => {
    try {
        await sendEmail({
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.error('[emailService] Error sending notification email:', error);
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

export default sendEmail;
