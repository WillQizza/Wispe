import 'mocha';
import * as chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/app';
import { getSequelize } from '../src/database';
chai.use(chaiHttp);

before(done => app.once('ready', done));

beforeEach(async () => {
    // Clear database prior to each test.
    await getSequelize().destroyAll();
});
