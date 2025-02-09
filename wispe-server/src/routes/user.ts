import { Router } from 'express';
import { fn, col, where } from '@sequelize/core';
import { validateInput } from '../middleware/validateInput';
import { User } from '../models/user';
import { apiMessage, errorApiMessage } from '../util/apiMessage';
import { generatePasswordHash, signJWT, validatePassword } from '../util/auth';
import loginPayloadSchema from '../schemas/user/login.json';
import registrationPayloadSchema from '../schemas/user/registration.json';
import updateSettingsSchema from '../schemas/user/updateSettings.json';

export const router = Router();

router.get('/users', async (_, res) => {
    const users = await User.findAll();
    
    const publicUserData = users.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName
    }));

    res.json(publicUserData);
});

// Registration is only allowed when done by an administrator
router.post('/user/register', validateInput(registrationPayloadSchema), async (req, res) => {
    const { id } = req.auth;
    
    // Can only be done by an admin
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('JWT valid but no user correlates to the provided JWT when fetching the user.');
    }
    if (!user.admin) {
        res.status(401)
            .json(errorApiMessage('Only administrators can perform this action.'));
        return;
    }

    const { username, password, displayName }: { username: string, password: string, displayName: string } = req.body;

    const [createdUser, created] = await User.findOrCreate({
        where: where(fn('lower', col('username')), username.toLowerCase()),
        defaults: {
            username,
            displayName,
            passwordHash: (await generatePasswordHash(password)),
            changePasswordRequested: true,
            admin: false
        }
    });

    if (!created) {
        res.status(409) // Conflict
            .json(errorApiMessage('Username already exists'));
        return;
    }

    res.json(apiMessage({
        id: createdUser.id,
        username: createdUser.username,
        displayName: createdUser.displayName,
        admin: createdUser.admin
    }));

});

// Login route: No JWT required for this route as it's the entry point.
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

router.post('/user', validateInput(updateSettingsSchema), async (req, res) => {
    const { id } = req.auth;
    
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('JWT valid but no user correlates to the provided JWT when fetching the user.');
    }

    const { username, password, displayName }: { username: string, password: string, displayName: string } = req.body;

    if (username && username !== user.username) {
        // Ensure username does not already exist.
        const existingUser = await User.findOne({
            where: where(fn('lower', col('username')), username.toLowerCase())
        });
        if (existingUser) {
            res.status(409) // conflict
                .json(errorApiMessage('Username already in use.'));
            return;
        }

        user.username = username;
    }
    if (password) {
        user.passwordHash = await generatePasswordHash(password);
    }
    if (displayName) {
        user.displayName = displayName;
    }
    
    await user.save();

    res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        admin: user.admin
    });
});

router.get('/user', async (req, res) => {
    const { id } = req.auth;

    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('JWT valid but no user correlates to the provided JWT when fetching the user.');
    }

    res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        admin: user.admin
    });
});