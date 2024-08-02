import { Request, Response } from 'express';

const ReadinessController = (_req: Request, res: Response) => {
    res.send('Application readiness');
};

export default ReadinessController;
