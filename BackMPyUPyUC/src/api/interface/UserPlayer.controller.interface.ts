import { NextFunction, Request, Response } from 'express';

export interface UserPlayerControllerInterface {
    login(req: Request, res: Response, next: NextFunction): Promise<void>;

    newUserPlayer(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void>;

    update(req: Request, res: Response, next: NextFunction): Promise<void>;

    inactivate(req: Request, res: Response, next: NextFunction): Promise<void>;
}
