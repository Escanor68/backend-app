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
exports.InvoiceService = void 0;
const payment_model_1 = require("../models/payment.model");
const database_1 = require("../config/database");
const pdf_generator_1 = require("../utils/pdf-generator");
const email_1 = require("../utils/email");
const path = __importStar(require("path"));
class InvoiceService {
    constructor() {
        this.paymentRepository = database_1.AppDataSource.getRepository(payment_model_1.Payment);
    }
    async generateInvoice(payment) {
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
                    field: payment.field,
                },
            };
            const pdfPath = path.join(__dirname, '..', '..', 'invoices', `${invoiceNumber}.pdf`);
            await (0, pdf_generator_1.createPDF)(pdfData, pdfPath);
            // Actualizar payment con la información de la factura
            payment.invoice = {
                number: invoiceNumber,
                url: `/invoices/${invoiceNumber}.pdf`,
                sentTo: [],
                lastSentAt: null,
            };
            await this.paymentRepository.save(payment);
            return pdfPath;
        }
        catch (error) {
            throw new Error('Error al generar la factura');
        }
    }
    async sendInvoiceEmail(payment, email) {
        try {
            if (!payment.invoice) {
                throw new Error('La factura no existe');
            }
            const invoicePath = path.join(__dirname, '..', '..', 'invoices', `${payment.invoice.number}.pdf`);
            await (0, email_1.sendEmail)({
                to: email,
                subject: `Factura ${payment.invoice.number}`,
                text: `Adjunto encontrará su factura por el pago ${payment.id}`,
                attachments: [
                    {
                        filename: `${payment.invoice.number}.pdf`,
                        path: invoicePath,
                    },
                ],
            });
            // Actualizar el registro de envíos
            payment.invoice.sentTo.push(email);
            payment.invoice.lastSentAt = new Date();
            await this.paymentRepository.save(payment);
        }
        catch (error) {
            throw new Error('Error al enviar la factura por email');
        }
    }
}
exports.InvoiceService = InvoiceService;
//# sourceMappingURL=invoice.service.js.map