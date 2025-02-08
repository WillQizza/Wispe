import { Router } from 'express';
import { fn, col, where } from '@sequelize/core';
import { validateInput } from '../middleware/validateInput';
import loginPayloadSchema from '../schemas/user/login.json';
import { User } from '../models/user';

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

});

router.post('/user', (req, res) => {
    
});

router.get('/user', (req, res) => {
    
});