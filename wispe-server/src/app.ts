import express from 'express';
import helmet from 'helmet';

import pinoHttp from 'pino-http';
import pino from 'pino';
import { API_PORT } from './config';

const pinoLogger = pino();

const app = express();

// Middleware
app.use(helmet());
app.use(pinoHttp());

app.disable('x-powered-by');

app.listen(API_PORT, () => {
    pinoLogger.info(`Started listening port ${API_PORT}`);
});