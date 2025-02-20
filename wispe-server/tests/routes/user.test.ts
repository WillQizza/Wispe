import 'mocha';
import { request } from "chai-http";
import { expect } from 'chai';
import app from '../../src/app';
import { createRandomUser, createUser } from '../utils';

describe('User API - Login/Registration', () => {
    it('should throw an error when incorrect credentials are provided', async () => {
        // No user exists
        let response = await request.agent(app)
            .post('/api/user/login')
            .send({ username: '1', password: '1' });
        
        expect(response.body.status).to.equal('ERROR');
        expect(response.statusCode).to.equal(401);

        // Incorrect password
        const user = await createUser({ username: 'test', displayName: 'test', password: 'test', isAdmin: false });
        response = await request.agent(app)
            .post('/api/user/login')
            .send({ username: user.username, password: '1' });
        
        expect(response.body.status).to.equal('ERROR');
        expect(response.statusCode).to.equal(401);
    });

    it('should log in the user when correct credentials are provided', async () => {
        const { username, password } = await createRandomUser({ isAdmin: false });

        const response = await request.agent(app)
            .post('/api/user/login')
            .send({ username, password });

        expect(response.body.status).to.equal('OK');
        expect(response.statusCode).to.equal(200);
    });    

    it('should allow me to register accounts if I am an admin', async () => {
        const { username, password, jwt } = await createRandomUser({ isAdmin: true });

        const response = await request.agent(app)
            .post('/api/user/register')
            .set('Authorization', `Bearer ${jwt}`)
            .send({ username: `${username}1`, password, displayName: username });

        expect(response.body.status).to.equal('OK');

        // Confirm we can login as the registered account
        const loginResponse = await request.agent(app)
            .post('/api/user/login')
            .send({ username: `${username}1`, password });
        
        expect(loginResponse.body.status).to.equal('OK');
    });

    it('should not allow me to register accounts if I NOT an admin', async () => {
        const { username, password, jwt } = await createRandomUser({ isAdmin: false });

        const response = await request.agent(app)
            .post('/api/user/register')
            .set('Authorization', `Bearer ${jwt}`)
            .send({ username: `${username}1`, password, displayName: username });

        expect(response.body.status).to.equal('ERROR');
    });

    it('should not let me register an account with an existing username', async () => {
        const { username, password, jwt } = await createRandomUser({ isAdmin: true });

        const response = await request.agent(app)
            .post('/api/user/register')
            .set('Authorization', `Bearer ${jwt}`)
            .send({ username, password, displayName: username });

        expect(response.body.status).to.equal('ERROR');
    });
});

describe('User API - User Information', () => {
    it('should retrieve a list of all users', async () => {
        const { username, jwt } = await createRandomUser({ isAdmin: true });
        const { username: usernameB } = await createRandomUser({ isAdmin: false });

        const response = await request.agent(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${jwt}`);

        expect(response.body.data.length).to.equal(2);
        expect(response.body.data[0].username).to.equal(username);
        expect(response.body.data[1].username).to.equal(usernameB);
    });

    it('should retrieve my information when requested', async () => {
        const { username, jwt } = await createRandomUser({ isAdmin: true });

        const response = await request.agent(app)
            .get('/api/user')
            .set('Authorization', `Bearer ${jwt}`);

        expect(response.body.data.username).to.equal(username);
    });

    it('should update my information when requested', async () => {
        const { username, jwt } = await createRandomUser({ isAdmin: true });

        const response = await request.agent(app)
            .post('/api/user')
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                username: `${username}1`,
                password: 'abc',
                displayName: `${username}1`
            });
        
        expect(response.body.data.username).to.equal(`${username}1`);
        expect(response.body.data.displayName).to.equal(`${username}1`);

        // Ensure password was changed
        const loginResponse = await request.agent(app)
            .post('/api/user/login')
            .send({ username: `${username}1`, password: 'abc' });
        
        expect(loginResponse.body.status).to.equal('OK');
    });

    it('should not allow me to update my username to an existing username', async () => {
        const { jwt } = await createRandomUser({ isAdmin: true });
        const { username: existingUsername } = await createRandomUser({ isAdmin: false });

        const response = await request.agent(app)
            .post('/api/user')
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                username: existingUsername
            });

        expect(response.body.status).to.equal('ERROR');
    });
});