import { Request, Response } from 'express';

// Controlador para verificar la disponibilidad de la aplicación
const LivenessController = (_req: Request, res: Response) => {
  // Enviar una respuesta indicando que la aplicación está viva
  res.send('Application liveness, hola mundo');
};

export default LivenessController;
