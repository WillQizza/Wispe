import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, Sequelize } from '@sequelize/core';

class PhotoFolder extends Model<InferAttributes<PhotoFolder>, InferCreationAttributes<PhotoFolder>> {
    declare id: CreationOptional<number>;
    declare parentID: ForeignKey<PhotoFolder> | null;
    declare name: string;
    declare lastModified: Date;
}

class Photo extends Model<InferAttributes<Photo>, InferCreationAttributes<Photo>> {
    declare id: CreationOptional<number>;
    declare folderID: ForeignKey<PhotoFolder>;
    declare data: Blob;
    declare name: string;
    declare uploaded: Date;
}

async function setup(sequelize: Sequelize) {
    await PhotoFolder.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        parentID: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: 'PhotoFolder'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastModified: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, { sequelize, tableName: 'PhotoFolder' });
    await Photo.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        folderID: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: PhotoFolder
        },
        data: {
            type: DataTypes.BLOB,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, { sequelize });
    await PhotoFolder.sync({ alter: true });
    await Photo.sync({ alter: true });
}

export {
    PhotoFolder,
    Photo,
    setup
};