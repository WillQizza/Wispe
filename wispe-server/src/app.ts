import express, { json } from 'express';
import { expressjwt } from 'express-jwt';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';

import pinoHttp from 'pino-http';
import pino from 'pino';
import { API_PORT, IN_TEST_ENVIRONMENT, JWT_BASE64_SECRET } from './config';

import { router as userRouter } from './routes/user';
import { router as calendarRouter } from './routes/calendar';
import { router as weatherRouter } from './routes/weather';
import { router as todoRouter } from './routes/todo';
import { errorHandler, notFoundHandler } from './routes/errors';
import { setupWhiteboard } from './routes/whiteboard';
import { setup as setupDatabase } from './database';
import { firstTimeServerCheck } from './util/firstSetup';
import { JwtPayload } from 'jsonwebtoken';
import { User } from './models/user';

const pinoLogger = pino({
    level: IN_TEST_ENVIRONMENT ? 'silent' : 'info'
});

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(pinoHttp({
    level: IN_TEST_ENVIRONMENT ? 'silent' : 'info'
}));
app.use(json({ limit: '10kb' }));

app.disable('x-powered-by');

app.use(expressjwt({
    secret: Buffer.from(JWT_BASE64_SECRET, 'base64'),
    algorithms: ['HS512'],
    isRevoked: async (req, token) => {
        if (!token || !(token.payload as JwtPayload).id) {
            return true;
        }

        // Ensure user exists
        const userExistsWithId = (await User.count({
            where: {
                id: (token.payload as JwtPayload).id
            }
        })) > 0;

        return !userExistsWithId;
    }
}).unless({ path: ['/api/user/login'] }));  // Logging in is the only route where JWT is not expected as that's where we hand you YOUR JWT

app.use('/api', userRouter);
app.use('/api', calendarRouter);
app.use('/api', weatherRouter);
app.use('/api', todoRouter);

// Error handlers
app.use(errorHandler);  // 501, 401, 400
app.use(notFoundHandler);   // 404

const io = new Server(server, {
    path: '/api/whiteboard/websocket/'
});
setupWhiteboard(io);

setupDatabase()
    .then(firstTimeServerCheck)
    .then(() => server.listen(API_PORT, () => {
        pinoLogger.info(`Started listening port ${API_PORT}`);
        app.emit('ready');
    }));

export default app;