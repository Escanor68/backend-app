declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
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
