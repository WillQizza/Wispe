import { Router } from 'express';
import { fn, col, where } from '@sequelize/core';
import { validateInput } from '../middleware/validateInput';
import loginPayloadSchema from '../schemas/user/login.json';
import { User } from '../models/user';
import { apiMessage, errorApiMessage } from '../util/apiMessage';
import { signJWT, validatePassword } from '../util/auth';

export const router = Router();

router.get('/users', (req, res) => {
    
});

router.post('/user/register', (req, res) => {
    
});

router.post('/user/login', validateInput(loginPayloadSchema), async (req, res) => {
    const { username, password }: { username: string, password: string } = req.body;
    
    const userFound = await User.findOne({
        where: where(fn('lower', col('username')), username.toLowerCase())
    });

    if (!userFound) {
        res.status(401)
            .json(errorApiMessage('Invalid Credentials'));
        return;
    }

    const passwordMatches = await validatePassword({
        password,
        passwordHash: userFound.passwordHash
    });

    if (!passwordMatches) {
        res.status(401)
            .json(errorApiMessage('Invalid Credentials'));
        return;
    }

    const jwt = await signJWT({
        id: userFound.id
    });

    req.log.info(`Login with user: ${userFound.username} (ID: ${userFound.id})`);

    res.json(apiMessage({ jwt }));
});

router.post('/user', (req, res) => {
    
});

router.get('/user', (req, res) => {
    
});