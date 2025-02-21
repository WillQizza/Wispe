import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../util/errors';

type ParamChoice = 'string' | 'number';

function validateParams(schema: { [key: string]: ParamChoice }) {
    return (req: Request, _: Response, next: NextFunction) => {
        for (const key in schema) {
            if (!(key in req.params)) {
                throw new ValidationError('Missing parameter');
            }
    
            // Strings are just autovalidated for now.
            if (schema[key] === 'number') {
                const n = parseInt(req.params[key]);
    
                if (isNaN(n) || !isFinite(n)) {
                    throw new ValidationError('Invalid parameter');
                }
            }
        }

        next();
    };
}

export {
    validateParams
};