import { Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import { setup as setupUserModel } from './models/user';
import { setup as setupEventModel } from './models/event';
import { setup as setupPhotoModel } from './models/photo';
import { setup as setupTodoModel } from './models/todo';
import { POSTGRES_DATABASE, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_USERNAME } from './config';

async function setup() {
    const sequelize = new Sequelize({
        dialect: PostgresDialect,
        database: POSTGRES_DATABASE,
        user: POSTGRES_USERNAME,
        password: POSTGRES_PASSWORD,
        host: POSTGRES_HOST,
        port: POSTGRES_PORT
    });

    // Setup/sync database model definitions
    const modelSetupFunctions: ((sequelize: Sequelize) => void)[] = [
        setupUserModel,
        setupEventModel,
        setupPhotoModel,
        setupTodoModel
    ];

    for (const setup of modelSetupFunctions) {
        await setup(sequelize);
    }
}

export {
    setup
};