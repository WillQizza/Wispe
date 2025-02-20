import 'mocha';
import { request } from "chai-http";
import { expect } from 'chai';
import app from '../../src/app';
import { createRandomUser } from '../utils';
import { CalendarEvent } from '../../src/models/event';

let ourUser: { username: string, password: string, jwt: string };
const currentYear = new Date().getFullYear();

describe('Calendar Tests - Calendar Retrieval', () => {
    beforeEach(async () => {
        ourUser = await createRandomUser({ isAdmin: false });
    });

    async function tryAttempts(attempts: { year: number, month: number, exist: boolean }[]) {
        for (const attempt of attempts) {
            const response = await request.agent(app)
                .get(`/api/calendar/${attempt.month}/${attempt.year}`)
                .set('Authorization', `Bearer ${ourUser.jwt}`);
            
            expect(response.body.data.events.length).to.equal(attempt.exist ? 1 : 0);
        }
    }

    it('should retrieve all events from the calendar matching the month and year', async () => {
        const events = [
            {
                date: new Date(2025, 1, 1),
                name: 'New Years 2025',
                description: "!"
            },
            {
                date: new Date(2026, 1, 1),
                name: 'New Years 2026',
                description: '!!'
            },
            {
                date: new Date(2025, 1, 5),
                name: 'Canada Day',
                description: 'Ohhh Canadaaaaa'
            }
        ];
        await CalendarEvent.bulkCreate(events);

        for (const event of events) {
            const response = await request.agent(app)
                .get(`/api/calendar/${event.date.getMonth() + 1}/${event.date.getFullYear()}`)
                .set('Authorization', `Bearer ${ourUser.jwt}`);

            expect(response.body.data.events.length).to.equal(1);
            expect(response.body.data.events[0].name).to.equal(event.name);
        }
    });

    it('should retrieve all yearly reoccurring events and their future events', async () => {
        await CalendarEvent.create({
                date: new Date(2025, 2, 1),
                name: 'Valentines Day',
                description: '!!!',
                reoccurIntervalType: 'yearly'
        });

        const attempts = [
            { year: 2025, month: 2, exist: true },  // The assigned date
            { year: 2025, month: 1, exist: false }, // Same year but earlier month
            { year: 2025, month: 3, exist: false }, // Same year but month is not the same
            { year: 2024, month: 2, exist: false }, // Previous year
            { year: 2026, month: 2, exist: true },  // Next year, correct month
            { year: 2026, month: 3, exist: false }  // Next year, wrong month
        ];

        await tryAttempts(attempts);
    });

    it('should retrieve all monthy reoccurring events and their future events', async () => {
        await CalendarEvent.create({
            date: new Date(2025, 2, 1),
            name: '1st of the month! (month >= Feb 2025)',
            description: '!!!',
            reoccurIntervalType: 'monthly'
        });

        const attempts = [
            { year: 2025, month: 2, exist: true },  // The assigned date
            { year: 2025, month: 1, exist: false }, // Same year but earlier month
            { year: 2025, month: 3, exist: true },  // Same year but month is different
            { year: 2026, month: 3, exist: true }  // Next year
        ];

        await tryAttempts(attempts);
    });

    it('should retrieve all yearly reoccurring leap year events and their future events correctly', async () => {
        await CalendarEvent.create({
            date: new Date(2024, 2, 29),
            name: 'Leap Day!',
            description: '!!!',
            reoccurIntervalType: 'yearly'
        });

        const attempts = [
            { year: 2024, month: 2, exist: true },  
            { year: 2025, month: 2, exist: false },
            { year: 2028, month: 2, exist: true }
        ];

        await tryAttempts(attempts);
    });

    it('should retrieve all monthly reoccurring leap year events and their future events correctly', async () => {
        await CalendarEvent.create({
            date: new Date(2024, 1, 29),
            name: '29!!!',
            description: '!!!',
            reoccurIntervalType: 'monthly'
        });

        const attempts = [
            { year: 2024, month: 1, exist: true },  
            { year: 2024, month: 2, exist: true },
            { year: 2025, month: 1, exist: true },
            { year: 2025, month: 2, exist: false },
            { year: 2028, month: 2, exist: true }
        ];

        await tryAttempts(attempts);
    });

    it('should error for out of ranges months', async () => {
        const attempts = [-1, 0, 13, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
        
        for (const month of attempts) {
            const response = await request.agent(app)
                .get(`/api/calendar/${month}/${currentYear}`)
                .set('Authorization', `Bearer ${ourUser.jwt}`);

            expect(response.body.status).to.equal('ERROR');
            expect(response.statusCode).to.equal(400);
        }
    });

    it('should error for out of range years', async () => {
        const response = await request.agent(app)
                .get('/api/calendar/1/-1')
                .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(response.body.status).to.equal('ERROR');
        expect(response.statusCode).to.equal(400);
    });
});

describe('Calendar Tests - Event Manipulation', () => {
    beforeEach(async () => {
        ourUser = await createRandomUser({ isAdmin: false });
    });
    
    it('should be able to create calendar events', async () => {
        const date = new Date(2025, 1, 1);
        const response = await request.agent(app)
            .post('/api/calendar/events')
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({
                time: date.getTime(),
                utcOffset: date.getTimezoneOffset(),
                name: 'Right Now',
                description: '!!!'
            });

        expect(response.body.status).to.equal('OK');

        const confirmEventExistsResponse = await request.agent(app)
            .get(`/api/calendar/${date.getMonth() + 1}/${date.getFullYear()}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(confirmEventExistsResponse.body.data.events.length).to.equal(1);
    });

    it('should error if given an invalid date', async () => {
        const response = await request.agent(app)
            .post('/api/calendar/events')
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({
                time: -1,
                utcOffset: -1,
                name: 'Wrong',
                description: '!!!'
            });

        expect(response.body.status).to.equal('ERROR');
    });

    it('should not error if given a leap day event', async () => {
        const date = new Date(2024, 2, 29);
        const response = await request.agent(app)
            .post('/api/calendar/events')
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({
                time: date.getTime(),
                utcOffset: date.getTimezoneOffset(),
                name: 'Right Now',
                description: '!!!'
            });

        expect(response.body.status).to.equal('OK');

        const confirmEventExistsResponse = await request.agent(app)
            .get('/api/calendar/2/2024')
            .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(confirmEventExistsResponse.body.data.events.length).to.equal(1);
    });

    it('should be able to retrieve specific calendar events', async () => {
        const event = await CalendarEvent.create({
            date: new Date(2024, 1, 1),
            name: 'New Years',
            description: '!!!'
        });

        const response = await request.agent(app)
            .get(`/api/calendar/events/${event.id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`);
        
        expect(response.body.status).to.equal('OK');
        expect(response.body.data.id).to.equal(event.id);
    });

    it('should error if the specified calendar event does not exist', async () => {
        const response = await request.agent(app)
            .get(`/api/calendar/events/999`)
            .set('Authorization', `Bearer ${ourUser.jwt}`);
        
        expect(response.statusCode).to.equal(404);
    });

    it('should be able to modify a calendar event', async () => {
        const event = await CalendarEvent.create({
            date: new Date(2024, 1, 1),
            name: 'New Years',
            description: '!!!'
        });

        const valentines = new Date(2025, 2, 14);

        const response = await request.agent(app)
            .post(`/api/calendar/events/${event.id}`)
            .send({
                time: valentines.getTime(),
                utcOffset: valentines.getTimezoneOffset(),
                name: 'Valentines Day',
                description: 'Wowie'
            });

        expect(response.body.status).to.equal('OK');

        const doubleCheckResponse = await request.agent(app)
            .get(`/api/calendar/events/${event.id}`);

        expect(doubleCheckResponse.body.data.name).to.equal('Valentines Day');
        expect(doubleCheckResponse.body.data.description).to.equal('Wowie');
    });

    it('should error if the specified calendar event we want to modify does not exist', async () => {
        const valentines = new Date(2025, 2, 14);
        const response = await request.agent(app)
            .post('/api/calendar/events/999')
            .send({
                time: valentines.getTime(),
                utcOffset: valentines.getTimezoneOffset(),
                name: 'Valentines Day',
                description: 'Wowie'
            });

        expect(response.body.status).to.equal('ERROR');
        expect(response.statusCode).to.equal(404);
    });

    it('should be able to delete a calendar event', async () => {
        const event = await CalendarEvent.create({
            date: new Date(2024, 1, 1),
            name: 'New Years',
            description: '!!!'
        });

        const response = await request.agent(app)
            .delete(`/api/calendar/events/${event.id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`);
        
        expect(response.body.status).to.equal('OK');

        const doubleCheckResponse = await request.agent(app)
            .get(`/api/calendar/events/${event.id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`);
        
        expect(doubleCheckResponse.statusCode).to.equal(404);
    });

    it('should error if the specified calendar event we want to delete does not exist', async () => {
        const response = await request.agent(app)
            .delete('/api/calendar/events/999')
            .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(response.body.status).to.equal('ERROR');
        expect(response.statusCode).to.equal(404);
    });
});