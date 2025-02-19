import 'mocha';
import { request } from "chai-http";
import app from '../../src/app';
import { expect } from 'chai';

describe('User Tests', () => {
    it('should throw an error when incorrect credentials are provided', async () => {
        const response = await request.agent(app)
            .post('/api/user/login')
            .send({ username: '1', password: '1' });
        
        expect(response.body.status).to.equal('ERROR');
        expect(response.statusCode).to.equal(401);
    });
});