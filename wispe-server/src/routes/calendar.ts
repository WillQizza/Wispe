import { Router } from 'express';
import { CalendarEvent } from '../models/event';
import { apiMessage } from '../util/apiMessage';
import { Op } from '@sequelize/core';

export const router = Router();

router.get('/calendar/:month/:year', async (req, res) => {
    const { month, year } = req.params;

    const events = await CalendarEvent.findAll({
        where: {
            date: {
                [Op.gte]: new Date(),
                [Op.lt]: new Date()
            }
        }
    });

    res.json(apiMessage(events.map(event => ({
        ...event
    }))));
});

router.post('/calendar/events', async (req, res) => {
    
});

router.get('/calendar/events/:eventId', (req, res) => {
    
});

router.post('/calendar/events/:eventId', (req, res) => {

});

router.delete('/calendar/events/:eventId', (req, res) => {
    
});