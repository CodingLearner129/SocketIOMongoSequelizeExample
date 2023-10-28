import Sequelize from "sequelize";
import sequelize from "./../../config/database.sql.js";

export const User = sequelize.define(
    "user", //where "user" is model name which is used for relationship
    {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },
        image: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        is_online: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        lastSeenAt: {
            type: Sequelize.DATE,
            allowNull: true,
        }
    },
    {
        tableName: 'users', // table name in database
        timestamps: true,
    }
);