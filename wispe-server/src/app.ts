import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';

import pinoHttp from 'pino-http';
import pino from 'pino';
import { API_PORT } from './config';

import { router as userRouter } from './routes/user';
import { router as calendarRouter } from './routes/calendar';
import { router as weatherRouter } from './routes/weather';
import { router as todoRouter } from './routes/todo';
import { setupWhiteboard } from './routes/whiteboard';
import { setup as setupDatabase } from './database';

const pinoLogger = pino();

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(pinoHttp());

app.disable('x-powered-by');

app.use('/api', userRouter);
app.use('/api', calendarRouter);
app.use('/api', weatherRouter);
app.use('/api', todoRouter);

const io = new Server(server, {
    path: '/api/whiteboard/websocket/'
});
setupWhiteboard(io);

setupDatabase()
    .then(() => server.listen(API_PORT, () => {
        pinoLogger.info(`Started listening port ${API_PORT}`);
    }));