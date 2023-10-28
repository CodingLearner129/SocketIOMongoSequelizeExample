import Sequelize from "sequelize";
import sequelize from "./../../config/database.sql.js";

export const Member = sequelize.define(
    "member", //where "user" is model name which is used for relationship
    {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        group_id:{
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        user_id:{
            type: Sequelize.BIGINT,
            allowNull: false,
        },
    },
    {
        tableName: 'members', // table name in database
        timestamps: true,
    }
);