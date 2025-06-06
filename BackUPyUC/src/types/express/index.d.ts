import 'express';

declare module 'express' {
    export interface Request {
        csrfToken?: () => string;
    }
}
