"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePDF = exports.createPDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Genera un PDF real usando PDFKit
 */
const createPDF = async (data, outputPath, options = {}) => {
    console.log('📄 [PDF Generator] Iniciando generación de PDF para pago:', data.payment.id);
    console.log('🔧 [PDF Generator] Opciones:', options);
    try {
        // Crear directorio si no existe
        const outputDir = path_1.default.dirname(outputPath);
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
            console.log('📁 [PDF Generator] Directorio creado:', outputDir);
        }
        // Configuración del documento
        const doc = new pdfkit_1.default({
            size: options.format || 'A4',
            margin: options.margin || 50,
            info: {
                Title: options.title || `Factura ${data.invoiceNumber}`,
                Author: options.author || 'FutbolApp',
                Subject: options.subject || `Factura de pago ${data.payment.id}`,
                Creator: 'FutbolApp Payment System',
                Producer: 'FutbolApp PDF Generator',
            },
        });
        // Pipe del documento al archivo
        const stream = fs_1.default.createWriteStream(outputPath);
        doc.pipe(stream);
        // Generar contenido del PDF
        await generateInvoiceContent(doc, data);
        // Finalizar el documento
        doc.end();
        // Esperar a que termine de escribirse
        await new Promise((resolve, reject) => {
            stream.on('finish', () => resolve());
            stream.on('error', reject);
        });
        console.log('✅ [PDF Generator] PDF generado exitosamente:', outputPath);
        return outputPath;
    }
    catch (error) {
        console.error('❌ [PDF Generator] Error generando PDF:', error);
        throw new Error(`Error generando PDF para el pago ${data.payment.id}: ${error}`);
    }
};
exports.createPDF = createPDF;
/**
 * Genera el contenido de la factura en el PDF
 */
async function generateInvoiceContent(doc, data) {
    const pageWidth = doc.page.width;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;
    let yPosition = margin;
    // Header de la empresa
    doc.fontSize(20)
        .font('Helvetica-Bold')
        .text('FUTBOLAPP', margin, yPosition, { align: 'left' });
    doc.fontSize(12)
        .font('Helvetica')
        .text('Sistema de Reservas de Canchas', margin, yPosition + 25);
    if (data.company) {
        doc.text(data.company.address || 'Dirección no disponible', margin, yPosition + 40);
        if (data.company.phone) {
            doc.text(`Tel: ${data.company.phone}`, margin, yPosition + 55);
        }
        if (data.company.email) {
            doc.text(`Email: ${data.company.email}`, margin, yPosition + 70);
        }
    }
    yPosition += 100;
    // Título de la factura
    doc.fontSize(18)
        .font('Helvetica-Bold')
        .text('FACTURA', pageWidth - margin - 100, yPosition, {
        align: 'right',
    });
    doc.fontSize(12)
        .font('Helvetica')
        .text(`Número: ${data.invoiceNumber}`, pageWidth - margin - 150, yPosition + 25, { align: 'right' });
    doc.text(`Fecha: ${data.date.toLocaleDateString('es-ES')}`, pageWidth - margin - 150, yPosition + 40, { align: 'right' });
    yPosition += 80;
    // Línea separadora
    doc.moveTo(margin, yPosition)
        .lineTo(pageWidth - margin, yPosition)
        .stroke();
    yPosition += 20;
    // Información del cliente
    if (data.customer) {
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('DATOS DEL CLIENTE:', margin, yPosition);
        yPosition += 20;
        doc.fontSize(12).font('Helvetica');
        if (data.customer.name) {
            doc.text(`Cliente: ${data.customer.name}`, margin, yPosition);
            yPosition += 15;
        }
        if (data.customer.email) {
            doc.text(`Email: ${data.customer.email}`, margin, yPosition);
            yPosition += 15;
        }
        if (data.customer.phone) {
            doc.text(`Teléfono: ${data.customer.phone}`, margin, yPosition);
            yPosition += 15;
        }
        yPosition += 20;
    }
    // Detalles del pago
    doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('DETALLES DEL PAGO:', margin, yPosition);
    yPosition += 25;
    // Tabla de detalles
    const tableTop = yPosition;
    const col1X = margin;
    const col2X = margin + 200;
    const col3X = margin + 350;
    const col4X = pageWidth - margin - 100;
    // Headers de la tabla
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('CONCEPTO', col1X, tableTop);
    doc.text('CANCHA', col2X, tableTop);
    doc.text('MÉTODO', col3X, tableTop);
    doc.text('IMPORTE', col4X, tableTop, { align: 'right' });
    yPosition = tableTop + 20;
    // Línea de headers
    doc.moveTo(margin, yPosition - 5)
        .lineTo(pageWidth - margin, yPosition - 5)
        .stroke();
    // Datos de la fila
    doc.fontSize(10).font('Helvetica');
    const concepto = 'Reserva de cancha de fútbol';
    const cancha = data.payment.field?.name || 'No especificada';
    const metodo = data.payment.paymentMethod || 'MercadoPago';
    const importe = `$${data.payment.amount.toFixed(2)}`;
    doc.text(concepto, col1X, yPosition);
    doc.text(cancha, col2X, yPosition);
    doc.text(metodo, col3X, yPosition);
    doc.text(importe, col4X, yPosition, { align: 'right' });
    yPosition += 20;
    // Línea final de la tabla
    doc.moveTo(margin, yPosition)
        .lineTo(pageWidth - margin, yPosition)
        .stroke();
    yPosition += 20;
    // Total
    doc.fontSize(14).font('Helvetica-Bold').text('TOTAL:', col3X, yPosition);
    doc.text(`$${data.payment.amount.toFixed(2)}`, col4X, yPosition, {
        align: 'right',
    });
    yPosition += 40;
    // Estado del pago
    doc.fontSize(12)
        .font('Helvetica')
        .text(`Estado del pago: ${getStatusText(data.payment.status)}`, margin, yPosition);
    doc.text(`ID de pago: ${data.payment.id}`, margin, yPosition + 15);
    if (data.payment.createdAt) {
        doc.text(`Fecha de pago: ${data.payment.createdAt.toLocaleDateString('es-ES')} ${data.payment.createdAt.toLocaleTimeString('es-ES')}`, margin, yPosition + 30);
    }
    yPosition += 80;
    // Footer
    doc.fontSize(10)
        .font('Helvetica')
        .text('Gracias por confiar en FutbolApp', margin, yPosition);
    doc.text('Esta factura fue generada automáticamente por el sistema.', margin, yPosition + 15);
    // QR Code placeholder (opcional)
    yPosition += 40;
    doc.fontSize(8).text(`Verificación: ${data.invoiceNumber}`, margin, yPosition);
}
/**
 * Convierte el estado del pago a texto legible
 */
function getStatusText(status) {
    const statusMap = {
        approved: 'APROBADO',
        pending: 'PENDIENTE',
        rejected: 'RECHAZADO',
        cancelled: 'CANCELADO',
        refunded: 'REEMBOLSADO',
    };
    return statusMap[status] || status.toUpperCase();
}
/**
 * Genera factura simplificada (versión legacy compatible)
 */
const generateInvoicePDF = async (payment, invoiceNumber, outputPath) => {
    const invoiceData = {
        invoiceNumber,
        date: new Date(),
        payment: {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            field: payment.field,
            createdAt: payment.createdAt,
        },
        company: {
            name: 'FutbolApp',
            address: 'Sistema de Reservas de Canchas',
            email: 'soporte@futbolapp.com',
        },
    };
    return await (0, exports.createPDF)(invoiceData, outputPath);
};
exports.generateInvoicePDF = generateInvoicePDF;
//# sourceMappingURL=pdf-generator.js.map