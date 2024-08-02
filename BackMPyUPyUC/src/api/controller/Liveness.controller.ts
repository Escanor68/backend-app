import { Request, Response } from 'express';

const LivenessController = (_req: Request, res: Response) => {
    res.send('Application liveness, hola mundo');
};

export default LivenessController;
