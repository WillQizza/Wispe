import 'mocha';
import { request } from "chai-http";
import app from '../../src/app';
import { expect } from 'chai';
import { createRandomUser } from '../utils';

describe('JWT Middleware Test', () => {
    it('should only allow me to access restricted resources if I provide a correct JWT', async () => {
        const { jwt } = await createRandomUser({ isAdmin: false });

        const response = await request.agent(app)
            .get('/api/user')
            .set('Authorization', `Bearer ${jwt}`);

        expect(response.body.status).to.equal('OK');
    });

    it('should not allow me to access restricted resources if I do not provide a correct JWT', async () => {
        const response = await request.agent(app)
            .get('/api/user')
            .set('Authorization', `Bearer 123`);

        expect(response.body.status).to.equal('ERROR');
    });

    it('should not allow me to access restricted resources if I do not provide any JWT', async () => {
        const response = await request.agent(app)
            .get('/api/user');

        expect(response.body.status).to.equal('ERROR');
    });
});