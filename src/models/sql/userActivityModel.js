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
        sender_id:{
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        is_online: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    },
    {
        tableName: 'users', // table name in database
        timestamps: true,
    }
);