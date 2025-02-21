import 'mocha';
import sinon from 'sinon';
import { assert, expect } from 'chai';
import { validateParams } from '../../src/middleware/validateParams';

describe('Validate Parameters Middleware Tests', () => {
    const middleware = validateParams({
        n: 'number',
        s: 'string'
    });

    it('should call the next function if validation was passed', () => {
        const request = {
            params: {
                n: 12,
                s: 'test'
            }
        } as any;

        const doneFunction = sinon.fake();

        middleware(request, {} as any, doneFunction);

        assert(doneFunction.called);
    });

    it('should throw an error if a validation type was not met', () => {
        const request = {
            params: {
                n: 'not a int',
                s: 'test'
            }
        } as any;

        expect(middleware.bind(globalThis, request, {} as any, () => {})).to.throw();
    });

    it('should throw an error if a validation param is missing', () => {
        const request = {
            params: {
                n: 12
            }
        } as any;

        expect(middleware.bind(globalThis, request, {} as any, () => {})).to.throw();
    });
});