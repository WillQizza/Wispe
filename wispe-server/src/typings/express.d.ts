declare namespace Express {
    export interface Request {
        auth: { [key: string]: any };
    }
}