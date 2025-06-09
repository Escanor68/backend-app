import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const rateLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: '❌ Demasiadas solicitudes desde esta IP, por favor intente más tarde',
    standardHeaders: true,
    legacyHeaders: false,
});
