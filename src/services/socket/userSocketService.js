import { User as userSqlModel } from "./../../models/sql/userModel.js";
import { user as userMongoModel } from "./../../models/mongo/userModel.js";
import { Chat as chatSqlModel } from "./../../models/sql/chatModel.js";
import { chat as chatMongoModel } from "./../../models/mongo/chatModel.js";
import sequelize from "../../config/database.sql.js";
import { Op } from "sequelize";

let onlineUser = [];

export const setOnlineStatus = async (socket, io, status) => {
    const transaction = await sequelize.transaction();
    const session = await userMongoModel.startSession();
    session.startTransaction();
    try {
        const email = socket.handshake.auth.token;
        console.log('---------------------------------');
        console.log("::setOnlineStatus::");
        console.log("email: " + email);
        console.log("status: " + status);
        console.log('---------------------------------');
        let lastSeenAt = new Date();

        const updateOnlineStatus = {
            is_online: status,
        }
        if (!status) {
            Object.assign(updateOnlineStatus, {
                lastSeenAt,
            });
            let index = onlineUser.findIndex(x => x.email == email);
            if (index !== -1) {
                onlineUser[index].socket_id = '';
            }
        } else {
            let index = onlineUser.findIndex(x => x.email == email);
            if (index !== -1) {
                onlineUser[index].socket_id = socket.id;
            } else {
                onlineUser.push({
                    email,
                    socket_id: socket.id,
                });
            }
        }

        const modelSql = await userSqlModel.update(updateOnlineStatus, {
            where: {
                email,
            },
            transaction
        });

        const modelMongo = await userMongoModel.findOneAndUpdate({ email }, {
            $set: updateOnlineStatus
        });

        await transaction.commit();
        await session.commitTransaction();

        const response = {
            status: true,
            data: {
                user_email: email,
                status,
                lastSeenAt
            },
        };

        console.log('---------------------------------');
        console.log("::setOnlineStatus:: response");
        console.log(response);
        console.log('---------------------------------');

        socket.broadcast.emit('getOnlineStatus', response);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        await session.abortTransaction();

        const response = {
            status: false,
            data: {},
        };

        console.log('---------------------------------');
        console.log("::setOnlineStatus:: response");
        console.log(response);
        console.log('---------------------------------');

        socket.broadcast.emit('getOnlineStatus', response);
    } finally {
        session.endSession();
    }
}

export const sendUserChat = async (socket, io, data) => {
    const transaction = await sequelize.transaction();
    const session = await chatMongoModel.startSession();
    session.startTransaction();
    try {

        console.log('---------------------------------');
        console.log("::sendUserChat:: data");
        console.log(data);
        console.log('---------------------------------');

        const { sender, receiver, message, chatId } = data;
        let modelChatSql, modelChatMongo;

        if (chatId != '') {
            let updatedAt = new Date();
            const updateChat = {
                message,
                updatedAt
            }

            const modelChatSqlGet = await chatSqlModel.findOne({
                where: {
                    id: chatId
                }
            });

            if (!modelChatSqlGet) {
                throw "chat not found";
            }

            const modelChatSqlUpdate = await chatSqlModel.update(updateChat, {
                where: {
                    id: modelChatSqlGet.id,
                },
                transaction
            });

            const modelSenderMongo = await userMongoModel.findOne({ email: sender });

            const modelReceiverMongo = await userMongoModel.findOne({ email: receiver });

            if (!modelSenderMongo && !modelSenderMongo) {
                throw "User not found";
            }
            const findChat = {
                sender_id: modelSenderMongo._id,
                receiver_id: modelReceiverMongo._id,
                message: modelChatSqlGet.message
            };
            modelChatMongo = await chatMongoModel.findOneAndUpdate(findChat, {
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

            const modelReceiverSql = await userSqlModel.findOne({
                where: { email: receiver },
                attributes: ["id", "name", "email", "image", "is_online"]
            });

            if (!modelSenderSql && !modelReceiverSql) {
                throw "User not found";
            } else {
                const chatSql = {
                    sender_id: modelSenderSql.id,
                    receiver_id: modelReceiverSql.id,
                    message,
                    createdAt,
                    updatedAt
                };
                modelChatSql = await chatSqlModel.create(chatSql, { transaction });
            }

            const modelSenderMongo = await userMongoModel.findOne({ email: sender });

            const modelReceiverMongo = await userMongoModel.findOne({ email: receiver });

            if (!modelSenderMongo && !modelReceiverMongo) {
                throw "User not found";
            } else {
                const chatMongo = {
                    sender_id: modelSenderMongo._id,
                    receiver_id: modelReceiverMongo._id,
                    message,
                    createdAt,
                    updatedAt
                };
                modelChatMongo = await chatMongoModel.create(chatMongo);
            }
        }

        await transaction.commit();
        await session.commitTransaction();

        if (chatId) {
            modelChatSql = await chatSqlModel.findOne({
                where: {
                    id: chatId
                }
            });
        }

        const response = {
            status: true,
            message: 'Message saved and sent successfully.',
            data: {
                sender,
                receiver,
                sql: modelChatSql,
                mongo: modelChatMongo,
                isUpdate: chatId != '' ? true : false
            }
        };

        console.log('---------------------------------');
        console.log("::sendUserChat:: response");
        console.log(response);
        console.log('---------------------------------');

        socket.emit('sendUserChat', response);
        let index = onlineUser.findIndex(x => x.email == receiver);
        if (index !== -1) {
            let socketId = onlineUser[index].socket_id;
            if (socketId) {
                console.log('---------------------------------');
                console.log("::receivedNewChat:: response");
                console.log(response);
                console.log('---------------------------------');
                io.to(socketId).emit('receivedNewChat', response);
            }
        }
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

export const loadOldChat = async (socket, io, data) => {
    try {

        console.log('---------------------------------');
        console.log("::loadOldChat:: data");
        console.log(data);
        console.log('---------------------------------');

        const { sender, receiver } = data;
        let modelChatSql, modelChatMongo;

        const modelSenderSql = await userSqlModel.findOne({
            where: { email: sender },
            attributes: ["id", "name", "email", "image", "is_online"]
        });

        const modelReceiverSql = await userSqlModel.findOne({
            where: { email: receiver },
            attributes: ["id", "name", "email", "image", "is_online"]
        });

        if (!modelSenderSql && !modelReceiverSql) {
            throw "User not found";
        } else {
            modelChatSql = await chatSqlModel.findAll({
                where: {
                    [Op.or]: [
                        {
                            sender_id: modelSenderSql.id,
                            receiver_id: modelReceiverSql.id,
                        },
                        {
                            sender_id: modelReceiverSql.id,
                            receiver_id: modelSenderSql.id,
                        }
                    ]
                }
            });
        }

        const modelSenderMongo = await userMongoModel.findOne({ email: sender });

        const modelReceiverMongo = await userMongoModel.findOne({ email: receiver });

        console.log(modelSenderMongo);

        if (!modelSenderMongo && !modelReceiverMongo) {
            throw "User not found";
        } else {
            const chatMongo = {
                sender_id: modelSenderMongo._id,
                receiver_id: modelReceiverMongo._id,
            };
            modelChatMongo = await chatMongoModel.aggregate([
                {
                    $match: {
                        $or: [
                            {
                                sender_id: modelSenderMongo._id,
                                receiver_id: modelReceiverMongo._id,
                            },
                            {
                                sender_id: modelReceiverMongo._id,
                                receiver_id: modelSenderMongo._id,
                            },
                        ]
                    },
                }
            ]);
        }

        const response = {
            status: true,
            message: 'Message load successfully.',
            data: {
                sender,
                receiver,
                sql: modelChatSql,
                mongo: modelChatMongo
            }
        };

        console.log('---------------------------------');
        console.log("::loadOldChat:: response");
        console.log(response);
        console.log('---------------------------------');

        socket.emit('loadOldChat', response);
    } catch (error) {
        console.log(error);

        const response = {
            status: false,
            message: 'Failed to load Message!',
            data: {}
        };

        console.log('---------------------------------');
        console.log("::loadOldChat:: response");
        console.log(response);
        console.log('---------------------------------');

        socket.emit('loadOldChat', response);
    }
}

export const deleteUserChat = async (socket, io, data) => {
    const transaction = await sequelize.transaction();
    const session = await chatMongoModel.startSession();
    session.startTransaction();
    try {

        console.log('---------------------------------');
        console.log("::deleteUserChat:: data");
        console.log(data);
        console.log('---------------------------------');

        const { sender, receiver, id } = data;
        let modelSql, modelMongo;

        const modelChatSql = await chatSqlModel.findOne({
            where: { id }
        });

        const modelChatMongo = await chatMongoModel.findOne({ message: modelChatSql.message });

        if (!modelChatSql && !modelChatMongo) {
            throw "User chat not found";
        } else {
            modelSql = await chatSqlModel.destroy({
                where: {
                    id: modelChatSql.id
                }
            }, { transaction });
            modelMongo = await chatMongoModel.findOneAndDelete({ _id: modelChatMongo._id });
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
        console.log("::deleteUserChat:: response");
        console.log(response);
        console.log('---------------------------------');

        socket.emit('deleteUserChat', response);
        let index = onlineUser.findIndex(x => x.email == receiver);
        if (index !== -1) {
            let socketId = onlineUser[index].socket_id;
            if (socketId) {
                console.log('---------------------------------');
                console.log("::removeUserChat:: response");
                console.log(response);
                console.log('---------------------------------');
                io.to(socketId).emit('removeUserChat', response);
            }
        }
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