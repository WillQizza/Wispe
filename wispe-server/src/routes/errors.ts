import { NextFunction, Request, Response } from 'express';
import { errorApiMessage } from '../util/apiMessage';
import { UnauthorizedError } from 'express-jwt';
import { ValidationError } from '../util/errors';

function notFoundHandler(_: Request, res: Response) {
    res.status(404)
        .json(errorApiMessage('Not Found'));
}

function errorHandler(err: Error, _: Request, res: Response, next: NextFunction) {
    if (err instanceof ValidationError) {
        res.status(400)
            .json(errorApiMessage('Invalid Payload'));
    } else if (err instanceof UnauthorizedError) {
        res.status(401)
            .json(errorApiMessage('Unauthorized'));
    } else {
        res.status(500)
            .json(errorApiMessage('Internal Server Error'));
    }
}

export {
    notFoundHandler,
    errorHandler
};