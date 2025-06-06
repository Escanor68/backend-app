import nodemailer from 'nodemailer';
import config from '../config';

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass,
    },
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
    try {
        await transporter.sendMail({
            from: config.email.from,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw new Error('Error al enviar email');
    }
};
