import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from '@sequelize/core';

type CalendarIntervalType = 'yearly' | 'monthly';

class CalendarEvent extends Model<InferAttributes<CalendarEvent>, InferCreationAttributes<CalendarEvent>> {
    declare id: CreationOptional<number>;
    declare date: Date;
    declare name: string;
    declare description: string;
    declare reoccurIntervalType: CalendarIntervalType | null;
}

async function setup(sequelize: Sequelize) {
    
}

export {
    CalendarEvent,
    setup
};