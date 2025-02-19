import { existsSync, writeFileSync } from 'fs';

// Ensure that test.env exists and has the node environment correctly set.
const TEST_ENV_PATH = './test.env';
const DEFAULT_TEST_ENV_SETTINGS = [
    'NODE_ENV=TEST'
];

const testEnvAlreadyExists = existsSync(TEST_ENV_PATH);

if (!testEnvAlreadyExists) {
    writeFileSync(TEST_ENV_PATH, DEFAULT_TEST_ENV_SETTINGS.join('\n'));
}