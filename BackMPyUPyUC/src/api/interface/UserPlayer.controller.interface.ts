import { NextFunction, Request, Response } from express;

export interface UserPlayerControllerInterface{
    getName(
        req: Request,
        res: Response
        next: NextFunction
    ): Promise <void>;
}