import 'mocha';
import sinon from 'sinon';
import { assert, expect } from 'chai';
import { validateInput } from '../../src/middleware/validateInput';
import { Schema } from 'ajv';

const TEST_SCHEMA: Schema = {
    type: 'object',
    properties: {
        test: { type: 'string' }
    },
    required: ['test'],
    additionalProperties: false
};

describe('Validate Input Middleware Tests', () => {
    const validator = validateInput(TEST_SCHEMA);

    it('should call the next function if validation was passed', () => {
        const request = {
            body: {
                test: 'this is a string'
            }
        } as any;

        const doneFunction = sinon.fake();

        validator(request, {} as any, doneFunction);

        assert(doneFunction.called);
    });

    it('should throw an error if validation was not passed', () => {
        const request = {
            body: {
                test: false // Not a string!
            }
        } as any;

        expect(validator.bind(globalThis, request, {} as any, () => {})).to.throw();
    });
});