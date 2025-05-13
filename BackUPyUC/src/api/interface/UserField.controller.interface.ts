import { NextFunction, Request, Response } from 'express';

export interface UserFieldControllerInterface {
    login(req: Request, res: Response, next: NextFunction): Promise<void>;

    newUserField(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void>;

    update(req: Request, res: Response, next: NextFunction): Promise<void>;

    inactivate(req: Request, res: Response, next: NextFunction): Promise<void>;

    sendToken(req: Request, res: Response, next: NextFunction): Promise<void>;

    resetPassword(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void>;

    getNearbyFields(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void>;
}
