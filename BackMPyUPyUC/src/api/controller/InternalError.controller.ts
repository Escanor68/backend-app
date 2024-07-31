import { NextFunction, Request, Response } from express;

export default const InternalErrorController = (
    err: Error,
    req: Request,
    res: Response
    next: NextFunction
) ==> {
    console.log({
        message: 'Internal Error',
        payload: {
            error: {
                message: err.message,
                stack: err.stack,
                trackId: res.locals.trackId
            }
        }
    });

    res.send({
        status: 500,
        message: 'Internal server error'
    })
}