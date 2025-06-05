import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email({ message: 'Email inválido' }),
    password: z
        .string()
        .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    name: z.string().min(2, { message: 'El nombre es obligatorio' }),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Email inválido' }),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(10, { message: 'Token inválido' }),
    newPassword: z.string().min(8, {
        message: 'La nueva contraseña debe tener al menos 8 caracteres',
    }),
});
