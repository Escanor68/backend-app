import { Request, Response } from 'express';

// Controlador para manejar solicitudes a rutas no encontradas
const NotFoundController = (req: Request, res: Response) => {
  // Enviar una respuesta con estado 404 y un mensaje
  res.status(404).send({
    status: 404,
    message: 'Not foundillo',
  });
};

export default NotFoundController;
