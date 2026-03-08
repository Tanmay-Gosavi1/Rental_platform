import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Nodemailer transporter configuration
 * Uses Gmail SMTP server for sending emails
 */
const transporter = nodemailer.createTransport({
    host : 'smtp-relay.brevo.com',
    port : 587,
    auth : {
        user : process.env.SMTP_USER,
        pass : process.env.SMTP_PASS,
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter configuration error:', error);
    } else {
        console.log('✉️  Email service is ready to send messages');
    }
});

export default transporter;