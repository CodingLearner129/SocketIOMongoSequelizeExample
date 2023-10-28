import Sequelize from "sequelize";
import sequelize from "./../../config/database.sql.js";

export const Group = sequelize.define(
    "group", //where "user" is model name which is used for relationship
    {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        creator_id:{
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        image: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        limit:{
            type: Sequelize.BIGINT,
            allowNull: false,
        }
    },
    {
        tableName: 'groups', // table name in database
        timestamps: true,
    }
);