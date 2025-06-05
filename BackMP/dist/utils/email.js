"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvoiceEmail = exports.sendEmail = void 0;
const sendEmail = async (options) => {
    console.log('📧 [Email Service] Iniciando envío de email');
    console.log('📬 [Email Service] Destinatario:', options.to);
    console.log('📝 [Email Service] Asunto:', options.subject);
    console.log('📎 [Email Service] Adjuntos:', options.attachments?.length || 0);
    try {
        // Validar opciones requeridas
        if (!options.to) {
            throw new Error('Email destinatario es requerido');
        }
        if (!options.subject) {
            throw new Error('Asunto del email es requerido');
        }
        if (!options.text && !options.html) {
            throw new Error('Contenido del email (text o html) es requerido');
        }
        console.log('✅ [Email Service] Validaciones pasadas');
        // Aquí iría la lógica real de envío de email
        // Por ejemplo, usando nodemailer, SendGrid, etc.
        // Simulación del envío
        await simulateEmailSending(options);
        console.log('✅ [Email Service] Email enviado exitosamente');
        return true;
    }
    catch (error) {
        console.error('❌ [Email Service] Error enviando email:', error);
        throw new Error(`Error enviando email a ${options.to}: ${error}`);
    }
};
exports.sendEmail = sendEmail;
const simulateEmailSending = async (options) => {
    console.log('🔄 [Email Service] Simulando envío de email...');
    // Simular delay de envío
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('📧 [Email Service] Email simulado enviado a:', options.to);
    console.log('📋 [Email Service] Contenido del email:');
    console.log('   Asunto:', options.subject);
    console.log('   Texto:', options.text?.substring(0, 100) + '...' || 'No text');
    console.log('   HTML:', options.html ? 'Presente' : 'No presente');
    if (options.attachments && options.attachments.length > 0) {
        console.log('📎 [Email Service] Adjuntos:');
        options.attachments.forEach((attachment, index) => {
            console.log(`   ${index + 1}. ${attachment.filename} (${attachment.path})`);
        });
    }
};
const sendInvoiceEmail = async (to, invoicePath, paymentId) => {
    console.log('📄 [Email Service] Enviando factura por email');
    console.log('🎯 [Email Service] Destinatario:', to);
    console.log('📋 [Email Service] ID de pago:', paymentId);
    console.log('📎 [Email Service] Ruta de factura:', invoicePath);
    const emailOptions = {
        to,
        subject: `Factura - Pago #${paymentId}`,
        html: `
            <h2>Tu factura está lista</h2>
            <p>Estimado cliente,</p>
            <p>Adjuntamos la factura correspondiente a tu pago #${paymentId}.</p>
            <p>Gracias por confiar en nuestros servicios.</p>
            <br>
            <p>Saludos cordiales,<br>Equipo de FutbolApp</p>
        `,
        text: `
            Tu factura está lista
            
            Estimado cliente,
            
            Adjuntamos la factura correspondiente a tu pago #${paymentId}.
            
            Gracias por confiar en nuestros servicios.
            
            Saludos cordiales,
            Equipo de FutbolApp
        `,
        attachments: [
            {
                filename: `factura-${paymentId}.pdf`,
                path: invoicePath,
                contentType: 'application/pdf',
            },
        ],
    };
    return await (0, exports.sendEmail)(emailOptions);
};
exports.sendInvoiceEmail = sendInvoiceEmail;
//# sourceMappingURL=email.js.map