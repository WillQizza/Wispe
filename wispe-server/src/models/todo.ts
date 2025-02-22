import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, Sequelize } from '@sequelize/core';

class TodoList extends Model<InferAttributes<TodoList>, InferCreationAttributes<TodoList>> {
    declare id: CreationOptional<number>;
    declare name: string;
}


class TodoItem extends Model<InferAttributes<TodoItem>, InferCreationAttributes<TodoItem>> {
    declare id: CreationOptional<number>;
    declare listID: ForeignKey<TodoList>;
    declare position: number;
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
            references: {
                model: TodoList,
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        position: {
            type: DataTypes.INTEGER,
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
    }, {
        sequelize,
        indexes: [
            {
                unique: true,
                fields: ['listID', 'position']
            }
        ],
        hooks: {
            beforeCreate: (item: TodoItem, _) => {
                if (item.completed) {
                    if (!item.completedOn) {
                        item.completedOn = new Date();
                    }
                } else {
                    item.completedOn = null;
                }
            },
            beforeUpdate: (item: TodoItem, _) => {
                if (item.completed) {
                    if (!item.completedOn) {
                        item.completedOn = new Date();
                    }
                } else {
                    item.completedOn = null;
                }
            }
        }
    });
    await TodoList.sync({ alter: true });
    await TodoItem.sync({ alter: true });
}

export {
    TodoList,
    TodoItem,
    setup
};