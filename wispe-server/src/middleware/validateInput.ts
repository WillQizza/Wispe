import { Request, Response, NextFunction } from 'express';
import Ajv, { ErrorObject, Schema, ValidationError } from "ajv";

const ajv = new Ajv();

function validateInput(schema: Schema) {
    return (req: Request, _: Response, next: NextFunction) => {
        const validator = ajv.compile(schema);

        if (validator(req.body)) {
            next();
        } else {
            throw new ValidationError(validator.errors as ErrorObject[]);
        }
    }; 
}

export {
    validateInput
};