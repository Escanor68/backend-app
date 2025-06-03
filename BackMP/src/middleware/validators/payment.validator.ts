import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Schema de validación para los items del pago
const PaymentItemSchema = z.object({
    title: z.string().min(1, 'El título es requerido'),
    quantity: z
        .number()
        .int()
        .positive('La cantidad debe ser un número positivo'),
    unit_price: z.number().positive('El precio debe ser un número positivo'),
    currency_id: z.string().min(3, 'La moneda es requerida').max(3),
});

// Schema de validación para el pagador
const PayerSchema = z.object({
    email: z.string().email('Email inválido'),
    name: z.string().optional(),
    identification: z
        .object({
            type: z.string().optional(),
            number: z.string().optional(),
        })
        .optional(),
});

// Schema principal para la solicitud de pago
const PaymentRequestSchema = z.object({
    items: z.array(PaymentItemSchema).min(1, 'Se requiere al menos un item'),
    payer: PayerSchema,
    back_urls: z
        .object({
            success: z.string().url().optional(),
            failure: z.string().url().optional(),
            pending: z.string().url().optional(),
        })
        .optional(),
    auto_return: z.enum(['approved', 'all']).optional(),
    notification_url: z.string().url().optional(),
});

export const validatePaymentRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        // Validar el cuerpo de la solicitud contra el schema
        await PaymentRequestSchema.parseAsync(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'Datos de pago inválidos',
                errors: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }

        return res.status(500).json({
            status: 'error',
            message: 'Error al validar los datos del pago',
        });
    }
};
