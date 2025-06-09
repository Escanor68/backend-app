import { Request } from 'express';
import { User } from '../models/user.model';
import passport from 'passport';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                roles: string[];
            };
            body: any;
            params: any;
            query: any;
            headers: any;
        }
    }
}
