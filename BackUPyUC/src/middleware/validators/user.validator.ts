import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const favoriteFieldSchema = z.object({
    fieldId: z.string().uuid(),
    name: z.string().min(1, 'El nombre es requerido')
});

const locationSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
});

const notificationPreferencesSchema = z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean()
});

const profileSchema = z.object({
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido').optional(),
    preferredLocation: locationSchema.optional(),
    notificationPreferences: notificationPreferencesSchema.optional()
});

export const validateFavoriteField = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await favoriteFieldSchema.parseAsync(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'Datos inválidos',
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        return res.status(500).json({ message: 'Error de validación' });
    }
};

export const validateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await profileSchema.parseAsync(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'Datos de perfil inválidos',
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        return res.status(500).json({ message: 'Error de validación' });
    }
}; 