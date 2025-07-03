"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePaymentRequest = void 0;
const zod_1 = require("zod");
// Schema de validación para los items del pago
const PaymentItemSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'El título es requerido'),
    quantity: zod_1.z
        .number()
        .int()
        .positive('La cantidad debe ser un número positivo'),
    unit_price: zod_1.z.number().positive('El precio debe ser un número positivo'),
    currency_id: zod_1.z.string().min(3, 'La moneda es requerida').max(3),
});
// Schema de validación para el pagador
const PayerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    name: zod_1.z.string().optional(),
    identification: zod_1.z
        .object({
        type: zod_1.z.string().optional(),
        number: zod_1.z.string().optional(),
    })
        .optional(),
});
// Schema principal para la solicitud de pago
const PaymentRequestSchema = zod_1.z.object({
    items: zod_1.z.array(PaymentItemSchema).min(1, 'Se requiere al menos un item'),
    payer: PayerSchema,
    back_urls: zod_1.z
        .object({
        success: zod_1.z.string().url().optional(),
        failure: zod_1.z.string().url().optional(),
        pending: zod_1.z.string().url().optional(),
    })
        .optional(),
    auto_return: zod_1.z.enum(['approved', 'all']).optional(),
    notification_url: zod_1.z.string().url().optional(),
});
const validatePaymentRequest = async (req, res, next) => {
    try {
        // Validar el cuerpo de la solicitud contra el schema
        await PaymentRequestSchema.parseAsync(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'Datos de pago inválidos',
                errors: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
            return;
        }
        res.status(500).json({
            status: 'error',
            message: 'Error al validar los datos del pago',
        });
        return;
    }
};
exports.validatePaymentRequest = validatePaymentRequest;
//# sourceMappingURL=payment.validator.js.map