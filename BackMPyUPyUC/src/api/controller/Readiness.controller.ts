import { Request, Response } from 'express';

// Controlador para manejar solicitudes de estado de preparación de la aplicación
const ReadinessController = (_req: Request, res: Response) => {
  // Enviar una respuesta indicando la preparación de la aplicación
  res.send('Application readiness');
};

export default ReadinessController;
