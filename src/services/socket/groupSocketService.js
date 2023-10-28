import { User as userSqlModel } from "./../../models/sql/userModel.js";
import { user as userMongoModel } from "./../../models/mongo/userModel.js";
import { Group as groupSqlModel } from "./../../models/sql/groupModel.js";
import { group as groupMongoModel } from "./../../models/mongo/groupModel.js";
import { GroupChat as groupChatSqlModel } from "./../../models/sql/groupChatModel.js";
import { groupChat as groupChatMongoModel } from "./../../models/mongo/groupChatModel.js";
import sequelize from "../../config/database.sql.js";
import { Op } from "sequelize";

export const loadOldGroupChat = async (socket, io, data) => {
    try {

        console.log('---------------------------------');
        console.log("::loadOldGroupChat:: data");
        console.log(data);
        console.log('---------------------------------');

        const { sender, group } = data;
        let modelChatSql, modelChatMongo;
        const modelSenderSql = await userSqlModel.findOne({
            where: { email: sender },
            attributes: ["id", "name", "email", "image", "is_online"]
        });

        const modelGroupSql = await groupSqlModel.findOne({
            where: { id: group }
        });

        if (!modelSenderSql) {
            throw "User not found";
        } else if(!modelGroupSql) {
            throw "Group not found";
        } else {
            modelChatSql = await groupChatSqlModel.findAll({
                where: {
                    group_id: group,
                },
                include: {
                    model: userSqlModel,
                    as: "user",
                    required: false,
                }
            });
        }

        const modelSenderMongo = await userMongoModel.findOne({ email: sender });

        const modelGroupMongo = await groupMongoModel.findOne({ name: modelGroupSql.name });

        if (!modelSenderMongo) {
            throw "User not found";
        } else if (!modelGroupMongo) {
            throw "Group not found";
        } else {
            modelChatMongo = await groupChatMongoModel.aggregate([
                {
                    $match: {
                        group_id: modelGroupMongo._id,
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        as: "user",
                        let: {
                            id: "$sender_id",
                        },
                        pipeline: [
                            {
                                $match:{
                                    $expr: {
                                        $eq: ["$_id", "$$id"]
                                    }
                                }
                            },
                        ]
                    }
                }
            ]);
        }

        const response = {
            status: true,
            message: 'Message load successfully.',
            data: {
                sender,
                group,
                sql: modelChatSql,
                mongo: modelChatMongo
            }
        };

        console.log('---------------------------------');
        console.log("::loadOldGroupChat:: response");
        console.log(response);
        console.log('---------------------------------');

        socket.emit('loadOldGroupChat', response);
    } catch (error) {
        console.log(error);

        const response = {
            status: false,
            message: 'Failed to load Message!',
            data: {}
        };

        console.log('---------------------------------');
        console.log("::loadOldGroupChat:: response");
        console.log(response);
        console.log('---------------------------------');

        socket.emit('loadOldGroupChat', response);
    }
}

export const sendGroupChat = async (socket, io, data) => {
    const transaction = await sequelize.transaction();
    const session = await groupChatMongoModel.startSession();
    session.startTransaction();
    try {

        console.log('---------------------------------');
        console.log("::sendGroupChat:: data");
        console.log(data);
        console.log('---------------------------------');

        const { sender, group, message, groupChatId } = data;
        let modelChatSql, modelChatMongo, whereCondition;

        if (groupChatId != '') {
            let updatedAt = new Date();
            const updateChat = {
                message,
                updatedAt
            }

            const modelChatSqlGet = await groupChatSqlModel.findOne({
                where: {
                    id: groupChatId
                }
            });

            if (!modelChatSqlGet) {
                throw "chat not found";
            }

            const modelChatSqlUpdate = await groupChatSqlModel.update(updateChat, {
                where: {
                    id: modelChatSqlGet.id,
                },
                transaction
            });

            const modelSenderMongo = await userMongoModel.findOne({ email: sender });

            const modelGroupSql = await groupSqlModel.findOne({
                where: { id: group }
            });

            const modelGroupMongo = await groupMongoModel.findOne({ name: modelGroupSql.name });

            if (!modelSenderMongo) {
                throw "User not found";
            } else if (!modelGroupMongo) {
                throw "Group not found";
            }
            const findChat = {
                sender_id: modelSenderMongo._id,
                group_id: modelGroupMongo._id,
                message: modelChatSqlGet.message
            };
            modelChatMongo = await groupChatMongoModel.findOneAndUpdate(findChat, {
                $set: updateChat
            }, {
                new: true
            });
        } else {
            let createdAt, updatedAt;
            createdAt = updatedAt = new Date();

            const modelSenderSql = await userSqlModel.findOne({
                where: { email: sender },
                attributes: ["id", "name", "email", "image", "is_online"]
            });

            const modelGroupSql = await groupSqlModel.findOne({
                where: { id: group }
            });

            if (!modelSenderSql) {
                throw "User not found";
            } else if (!modelGroupSql) {
                throw "Group not found";
            } else {
                const chatSql = {
                    sender_id: modelSenderSql.id,
                    group_id: modelGroupSql.id,
                    message,
                    createdAt,
                    updatedAt
                };
                modelChatSql = await groupChatSqlModel.create(chatSql, { transaction });
            }

            const modelSenderMongo = await userMongoModel.findOne({ email: sender });

            const modelGroupMongo = await groupMongoModel.findOne({ name: modelGroupSql.name });

            if (!modelSenderMongo) {
                throw "User not found";
            } else if (!modelGroupMongo){
                throw "Group not found";
            } else {
                const chatMongo = {
                    sender_id: modelSenderMongo._id,
                    group_id: modelGroupMongo._id,
                    message,
                    createdAt,
                    updatedAt
                };
                modelChatMongo = await groupChatMongoModel.create(chatMongo);
            }
        }

        await transaction.commit();
        await session.commitTransaction();

        if (groupChatId) {
            whereCondition = {
                id: groupChatId
            };
        } else {
            whereCondition = {
                id: modelChatSql.id
            };
        }
        
        let modelGroupChatSql = await groupChatSqlModel.findOne({
            where: whereCondition,
            include: {
                model: userSqlModel,
                as: "user",
                required: false,
            }
        });

        let modelGroupChatMongo = await groupChatMongoModel.aggregate([
            {
                $match: {
                    chat_id: modelChatMongo._id,
                },
            },
            {
                $lookup: {
                    from: "users",
                    as: "user",
                    let: {
                        id: "$sender_id",
                    },
                    pipeline: [
                        {
                            $match:{
                                $expr: {
                                    $eq: ["$_id", "$$id"]
                                }
                            }
                        },
                    ]
                }
            }
        ]);

        const response = {
            status: true,
            message: 'Message saved and sent successfully.',
            data: {
                sender,
                group,
                sql: modelGroupChatSql,
                mongo: modelGroupChatMongo,
                isUpdate: groupChatId != '' ? true : false
            }
        };

        console.log('---------------------------------');
        console.log("::sendGroupChat:: response");
        console.log(response);
        console.log('---------------------------------');
        
        socket.emit('sendGroupChat', response);

        console.log('---------------------------------');
        console.log("::receivedNewGroupChat:: response");
        console.log(response);
        console.log('---------------------------------');
        
        io.to(`#room@${group}`).emit('receivedNewGroupChat', response);
    } catch (error) {
        console.log(error);

        await transaction.rollback();
        await session.abortTransaction();

        const response = {
            status: false,
            message: 'Failed to send Message!',
            data: {}
        };

        console.log('---------------------------------');
        console.log("::sendUserChat:: response");
        console.log(response);
        console.log('---------------------------------');

        socket.emit('sendUserChat', response);
    } finally {
        session.endSession();
    }
}

export const deleteGroupChat = async (socket, io, data) => {
    const transaction = await sequelize.transaction();
    const session = await groupChatMongoModel.startSession();
    session.startTransaction();
    try {

        console.log('---------------------------------');
        console.log("::deleteGroupChat:: data");
        console.log(data);
        console.log('---------------------------------');

        const { sender, group, id } = data;
        let modelSql, modelMongo;

        const modelChatSql = await groupChatSqlModel.findOne({
            where: { id }
        });

        const modelGroupSql = await groupSqlModel.findOne({
            where: { id: group }
        });

        const modelGroupMongo = await groupMongoModel.findOne({ name: modelGroupSql.name });

        const modelChatMongo = await groupChatMongoModel.findOne({ message: modelChatSql.message, group_id: modelGroupMongo._id });

        if (!modelChatSql && !modelChatMongo) {
            throw "User chat not found";
        } else {
            modelSql = await groupChatSqlModel.destroy({
                where: {
                    id: modelChatSql.id
                }
            }, { transaction });
            modelMongo = await groupChatMongoModel.findOneAndDelete({ _id: modelChatMongo._id });
        }

        await transaction.commit();
        await session.commitTransaction();

        const response = {
            status: true,
            message: 'Message delete successfully.',
            data: {
                sender,
                id
            }
        };

        console.log('---------------------------------');
        console.log("::deleteGroupChat:: response");
        console.log(response);
        console.log('---------------------------------');

        socket.emit('deleteGroupChat', response);

        console.log('---------------------------------');
        console.log("::removeGroupChat:: response");
        console.log(response);
        console.log('---------------------------------');
        
        io.to(`#room@${group}`).emit('removeGroupChat', response);
    } catch (error) {
        console.log(error);

        await transaction.rollback();
        await session.abortTransaction();

        const response = {
            status: false,
            message: 'Failed to delete Message!',
            data: {}
        };

        console.log('---------------------------------');
        console.log("::deleteUserChat:: response");
        console.log(response);
        console.log('---------------------------------');

        socket.emit('deleteUserChat', response);
    } finally {
        session.endSession();
    }
}