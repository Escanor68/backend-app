import { NextFunction, Request, Response } from 'express';
// import logger from '../../infrastructure/helpers/newrelic';

const InternalErrorController = (
    err: Error,
    req: Request,
    res: Response,
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    next: NextFunction,
) => {
    console.log({
        message: 'Internal error',
        payload: {
            error: {
                message: err.message,
                stack: err.stack,
                trackId: res.locals.trackId,
            },
        },
    });

    res.send({
        status: 500,
        message: 'Internal server error',
    });
};

export default InternalErrorController;
