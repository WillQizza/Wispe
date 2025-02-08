import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, Sequelize } from '@sequelize/core';

class TodoList extends Model<InferAttributes<TodoList>, InferCreationAttributes<TodoList>> {
    declare id: CreationOptional<number>;
    declare name: string;
}


class TodoItem extends Model<InferAttributes<TodoItem>, InferCreationAttributes<TodoItem>> {
    declare id: CreationOptional<number>;
    declare listID: ForeignKey<TodoList>;
    declare name: string;
    declare completed: boolean;
    declare completedOn: Date | null;
}

async function setup(sequelize: Sequelize) {
    await TodoList.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, { sequelize });
    await TodoItem.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        listID: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: TodoList
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        completedOn: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, { sequelize });
    await TodoList.sync({ alter: true });
    await TodoItem.sync({ alter: true });
}

export {
    TodoList,
    TodoItem,
    setup
};