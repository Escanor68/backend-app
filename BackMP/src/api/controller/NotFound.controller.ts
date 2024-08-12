import { Request, Response } from 'express';

const NotFoundController = (req: Request, res: Response) => {
    res.status(404).send({
        status: 404,
        message: 'Not foundillo',
    });
};

export default NotFoundController;
