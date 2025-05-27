import { Payment } from '../models/payment.model';
import { AppDataSource } from '../config/database';
import { createPDF } from '../utils/pdf-generator';
import { sendEmail } from '../utils/email';
import { config } from '../config';
import * as path from 'path';

export class InvoiceService {
    private paymentRepository = AppDataSource.getRepository(Payment);

    async generateInvoice(payment: Payment): Promise<string> {
        try {
            // Generar número de factura único
            const invoiceNumber = `INV-${payment.id.slice(0, 8)}-${Date.now()}`;

            // Crear PDF
            const pdfData = {
                invoiceNumber,
                date: new Date(),
                payment: {
                    id: payment.id,
                    amount: payment.amount,
                    status: payment.status,
                    paymentMethod: payment.paymentMethod,
                    field: payment.field
                }
            };

            const pdfPath = path.join(__dirname, '..', '..', 'invoices', `${invoiceNumber}.pdf`);
            await createPDF(pdfData, pdfPath);

            // Actualizar payment con la información de la factura
            payment.invoice = {
                number: invoiceNumber,
                url: `/invoices/${invoiceNumber}.pdf`,
                sentTo: [],
                lastSentAt: null
            };

            await this.paymentRepository.save(payment);

            return pdfPath;
        } catch (error) {
            throw new Error('Error al generar la factura');
        }
    }

    async sendInvoiceEmail(payment: Payment, email: string): Promise<void> {
        try {
            if (!payment.invoice) {
                throw new Error('La factura no existe');
            }

            const invoicePath = path.join(__dirname, '..', '..', 'invoices', `${payment.invoice.number}.pdf`);
            
            await sendEmail({
                to: email,
                subject: `Factura ${payment.invoice.number}`,
                text: `Adjunto encontrará su factura por el pago ${payment.id}`,
                attachments: [{
                    filename: `${payment.invoice.number}.pdf`,
                    path: invoicePath
                }]
            });

            // Actualizar el registro de envíos
            payment.invoice.sentTo.push(email);
            payment.invoice.lastSentAt = new Date();
            await this.paymentRepository.save(payment);
        } catch (error) {
            throw new Error('Error al enviar la factura por email');
        }
    }
} 