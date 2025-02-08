import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from '@sequelize/core';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>;
    declare username: string;
    declare passwordHash: string;
    declare changePasswordRequested: boolean;
    declare displayName: string;
    declare admin: boolean;
}

async function setup(sequelize: Sequelize) {
    await User.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        changePasswordRequested: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, { sequelize });
    
    await User.sync({ alter: true });
}

export {
    User,
    setup
};