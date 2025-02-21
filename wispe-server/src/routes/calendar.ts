import { Router } from 'express';
import { fn, where, literal } from '@sequelize/core';
import { CalendarEvent } from '../models/event';
import { apiMessage, errorApiMessage } from '../util/apiMessage';
import { Op } from '@sequelize/core';
import { validateInput } from '../middleware/validateInput';
import eventCreationSchema from '../schemas/calendar/create.json';
import { validateParams } from '../middleware/validateParams';

function getServerTime(now: number, utcOffset: number) {
    const serverTime = new Date(now + utcOffset * 60 * 1000);
    return serverTime;
}

export const router = Router();

router.post('/calendar/events', validateInput(eventCreationSchema), async (req, res) => {
    const { time, utcOffset, name, description, intervalType } = req.body;

    if (time < 0 || utcOffset < 0) {
        res.status(400).json(errorApiMessage('Invalid time or UTC offset'));
        return;
    }

    const serverDate = getServerTime(time, utcOffset);

    const event = await CalendarEvent.create({
        name,
        description,
        date: serverDate,
        reoccurIntervalType: intervalType
    });

    res.json(apiMessage({
        id: event.id,
        name,
        description,
        intervalType
    }));
});

router.get('/calendar/events/:eventId', validateParams({ eventId: 'number' }), async (req, res) => {
    const { eventId } = req.params;

    const event = await CalendarEvent.findByPk(eventId);
    if (!event) {
        res.status(404).json(errorApiMessage('No event found'));
        return;
    }

    res.json(apiMessage({
        id: event.id,
        name: event.name,
        description: event.description,
        intervalType: event.reoccurIntervalType
    }));
});

router.post('/calendar/events/:eventId', validateParams({ eventId: 'number' }), async (req, res) => {
    const { eventId } = req.params;

    const event = await CalendarEvent.findByPk(eventId);
    if (!event) {
        res.status(404).json(errorApiMessage('No event found'));
        return;
    }

    const { time, utcOffset, name, description, intervalType } = req.body;
    
    if (time) {
        event.date = getServerTime(time, utcOffset);
    }

    if (name) {
        event.name = name;
    }

    if (description) {
        event.description = description;
    }

    if (intervalType) {
        event.reoccurIntervalType = intervalType;
    }

    await event.save();

    res.json(apiMessage({
        id: event.id,
        name: event.name,
        description: event.description,
        intervalType: event.reoccurIntervalType
    }));
});

router.delete('/calendar/events/:eventId', validateParams({ eventId: 'number' }), async (req, res) => {
    const { eventId } = req.params;

    const deleteResults = await CalendarEvent.destroy({
        where: {
            id: eventId
        }
    });

    if (deleteResults === 0) {
        res.status(404).json(errorApiMessage('No event found'));
        return;
    }

    res.json(apiMessage({}));
});

router.get('/calendar/:month/:year', validateParams({ month: 'number', year: 'number' }), async (req, res) => {
    const { month: monthStr, year: yearStr } = req.params;

    const month = parseInt(monthStr);
    const year = parseInt(yearStr);

    if (month <= 0 || month > 12 || year < 0) {
        res.status(400).json(errorApiMessage('Invalid month of year'));
        return;
    }

    const events = await CalendarEvent.findAll({
        where: {
            [Op.or]: [
                // Current month and year
                {
                    [Op.and]: [
                        where(fn('EXTRACT', literal('MONTH FROM date')), month),
                        where(fn('EXTRACT', literal('YEAR FROM date')), year)
                    ]
                },
                // Reoccurring?
                {
                    [Op.and]: [
                        { reoccurIntervalType: { [Op.ne]: null } },
                        {
                            [Op.or]: [
                                // Yearly reoccur?
                                {
                                    [Op.and]: [
                                        { reoccurIntervalType: { [Op.eq]: 'yearly' } },
                                        where(fn('EXTRACT', literal('MONTH FROM date')), month),
                                        where(fn('EXTRACT', literal('YEAR FROM date')), { [Op.lte]: year }),
                                    ]
                                },

                                // Monthly reoccur?
                                {
                                    [Op.and]: [
                                        { reoccurIntervalType: { [Op.eq]: 'monthly' } },
                                        {
                                            [Op.or]: [
                                                {
                                                    [Op.and]: [
                                                        // If the same year...
                                                        where(fn('EXTRACT', literal('YEAR FROM date')), { [Op.eq]: year }),
                                                        where(fn('EXTRACT', literal('MONTH FROM date')), { [Op.lte]: month })
                                                    ]
                                                },
                                                {
                                                    [Op.and]: [
                                                        // If AFTER the original year
                                                        where(fn('EXTRACT', literal('YEAR FROM date')), { [Op.lt]: year })
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            [Op.or]: [
                                where(month, { [Op.ne]: 2 }),   // We aren't requesting events in Feb...
                                where(fn('EXTRACT', literal('DAY FROM date')), { [Op.ne]: 29 }),    // We are requesting Feb smth but not the 29th

                                // Event is feburary 29th...
                                // Make sure year requested is a leap year
                                {
                                    [Op.and]: [
                                        where(fn('MOD', year, 4), 0),
                                        {
                                            [Op.or]: [
                                                where(fn('MOD', year, 100), { [Op.ne]: 0 }),
                                                where(fn('MOD', year, 400), 0)
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    });

    res.json(apiMessage({
        events: events.map(({ id, name, description, reoccurIntervalType, date }) => {
            date.setFullYear(year);
            date.setMonth(month - 1);

            return {
                id,
                name,
                description,
                intervalType: reoccurIntervalType,
                date: date.toISOString()
            };
        })
    }));
});