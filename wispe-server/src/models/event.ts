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
    await CalendarEvent.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reoccurIntervalType: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, { sequelize });
    await CalendarEvent.sync({ alter: true });
}

export {
    CalendarEvent,
    setup
};