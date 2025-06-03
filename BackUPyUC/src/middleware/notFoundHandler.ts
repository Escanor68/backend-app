import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.log(
        `🔍 [NotFoundHandler] Ruta no encontrada: ${req.method} ${req.path}`,
    );
    console.log(`🔍 [NotFoundHandler] IP: ${req.ip}`);
    console.log(`🔍 [NotFoundHandler] User-Agent: ${req.get('User-Agent')}`);

    return res.status(404).json({
        status: 'error',
        code: 404,
        message: `Ruta no encontrada: ${req.method} ${req.path}`,
        timestamp: new Date().toISOString(),
        path: req.path,
    });
};
