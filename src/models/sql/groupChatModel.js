import Sequelize from "sequelize";
import sequelize from "./../../config/database.sql.js";

export const GroupChat = sequelize.define(
    "group_chat", //where "user" is model name which is used for relationship
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
        group_id:{
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        message:{
            type: Sequelize.STRING,
            allowNull: false,
        }
    },
    {
        tableName: 'group_chats', // table name in database
        timestamps: true,
    }
);