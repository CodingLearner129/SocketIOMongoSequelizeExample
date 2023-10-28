import { User as userSqlModel } from "./../models/sql/userModel.js";
import { user as userMongoModel } from "./../models/mongo/userModel.js";
import { Group as groupSqlModel } from "./../models/sql/groupModel.js";
import { group as groupMongoModel } from "./../models/mongo/groupModel.js";
import { Member as memberSqlModel } from "./../models/sql/memberModel.js";
import { member as memberMongoModel } from "./../models/mongo/memberModel.js";
import bcrypt from "bcrypt";
import { config } from "./../config/config.js";
import sequelize from "../config/database.sql.js";
import { Op } from 'sequelize';
import mongoose from "mongoose";

export const registerForm = async (req, res, next) => {
    try {
        res.render('register', { url: "/v1/users/register", page: "/register", auth: req.auth });
    } catch (error) {
        console.log(error.message);
    }
}

export const register = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    const session = await userMongoModel.startSession();
    session.startTransaction();
    // if (!req.file) {
    //     return res.status(422).json({
    //         status: false,
    //         message: "Validation Error",
    //         error: {
    //             image: {
    //                 message: "The image field is mandatory.",
    //             }
    //         }
    //     });
    // }
    try {
        const { name, email, password } = req.body;
        const user = {
            name,
            email,
            image: `images/${req.file.filename}`,
            password: await bcrypt.hash(password, Number(config.bcrypt_salt_round))
        };
        await userSqlModel.create(user, { transaction });
        await userMongoModel.create(user);
        await transaction.commit();
        await session.commitTransaction();
        res.status(200).send({
            status: true,
            message: "User registered successfully.",
            url: "/login",
        });
    } catch (error) {
        await transaction.rollback();
        await session.abortTransaction();
        res.status(400).send({
            status: false,
            message: "Something went wrong",
            error
        });
    } finally {
        session.endSession();
    }
}

export const loginForm = async (req, res, next) => {
    try {
        res.render('login', { url: "/v1/users/login", page: "/login", auth: req.auth });
    } catch (error) {
        console.log(error.message);
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const modelSql = await userSqlModel.findOne({
            where: { email },
            attributes: ["id", "name", "email", "image", "password", "is_online"]
        });
        const modelMongo = await userMongoModel.findOne({ email }).select("+password");

        if (!modelSql || !(await bcrypt.compare(password, modelSql.password)) || !modelMongo || !(await bcrypt.compare(password, modelMongo.password))) {
            return res.status(401).send({
                status: false,
                message: "Incorrect email or password.",
                error: {
                    error: {
                        message: "Incorrect email or password.",
                    }
                }
            });
        }

        req.session.user = modelSql;
        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
            secure: req.secure || req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https'
        };
        res.cookie("user", JSON.stringify(modelSql), cookieOptions);

        res.status(200).send({
            status: true,
            message: "User login successfully.",
            url: "/dashboard",
        });
    } catch (error) {
        console.log(error);
        res.status(401).send({
            status: false,
            message: "Unauthorized access",
            error: {
                error: {
                    message: "Incorrect email or password.",
                }
            }
        });
    }
}

export const logout = async (req, res, next) => {
    try {
        res.cookie("user", "logout", {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });
        console.log(req.session);
        req.session.destroy();
        console.log(req.session);
        res.redirect('/login');
    } catch (error) {
        console.log(error.message);
    }
}

export const dashboard = async (req, res, next) => {
    try {
        const modelSql = await userSqlModel.findAll({
            where: {
                email: { [Op.notIn]: [req.session.user.email] }
            },
            attributes: ["id", "name", "email", "image", "password", "is_online", "lastSeenAt"]
        });

        const modelMongo = await userMongoModel.aggregate([
            {
                $match: {
                    email: {
                        $nin: [req.session.user.email],
                    },
                },
            }
        ]);

        if (modelSql.length === 0 && modelMongo.length === 0) {
            res.render('dashboard', { user: req.session.user, logout: "/v1/users/logout", page: "/dashboard", auth: req.auth });
        } else {
            res.render('dashboard', { user: req.session.user, logout: "/v1/users/logout", page: "/dashboard", auth: req.auth, users: modelSql });
        }
    } catch (error) {
        console.log(error.message);
    }
}

export const groupForm = async (req, res, next) => {
    try {
        const modelSql = await groupSqlModel.findAll({
            where: {
                creator_id: req.session.user.id
            },
        });

        const modelMongoUser = await userMongoModel.findOne({ email: req.session.user.email });

        const modelMongo = await groupMongoModel.aggregate([
            {
                $match: {
                    creator_id: {
                        $eq: modelMongoUser._id,
                    }
                },
            }
        ]);
        let data = {
            user: req.session.user,
            url: "/v1/users/group",
            memberUrl: "/v1/users/group/members",
            logout: "/v1/users/logout",
            page: "/group",
            auth: req.auth
        };
        if (modelSql.length > 0 && modelMongo.length > 0) {
            data.groups = modelSql;
        }
        res.render('group', data);
    } catch (error) {
        console.log(error.message);
    }
}

export const group = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    const session = await groupMongoModel.startSession();
    session.startTransaction();
    try {
        const { name, limit } = req.body;
        let group = {
            creator_id: req.session.user.id,
            name,
            limit,
            image: `images/${req.file.filename}`,
        };
        const modelSqlCreate = await groupSqlModel.create(group, { transaction });
        const modelMongo = await userMongoModel.findOne({ email: req.session.user.email });
        group = {
            creator_id: modelMongo._id,
            name,
            limit,
            image: `images/${req.file.filename}`,
        };
        const modelMongoCreate = await groupMongoModel.create(group);
        await transaction.commit();
        await session.commitTransaction();
        res.status(200).send({
            status: true,
            message: "Group created successfully.",
            data: modelSqlCreate,
            isUpdate: false
        });
    } catch (error) {
        await transaction.rollback();
        await session.abortTransaction();
        res.status(400).send({
            status: false,
            message: "Something went wrong",
            error
        });
    } finally {
        session.endSession();
    }
}

export const updateGroup = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    const session = await groupMongoModel.startSession();
    session.startTransaction();
    try {
        const { group_id, last_limit, name, limit } = req.body;

        if (last_limit > limit) {
            throw `Limit can't be less than ${last_limit}`;
        }

        let group = {
            name,
            limit,
        };
        if (req.file) {
            group.image = `images/${req.file.filename}`;
        }
        const modelSql = await groupSqlModel.findOne({
            where: {
                id: group_id
            }
        });
        const modelSqlUpdate = await groupSqlModel.update(group, { 
            where: {
                id: group_id
            },
            transaction 
        });

        const modelMongo = await groupMongoModel.findOne({ name: modelSql.name, limit: last_limit });
        const modelMongoCreate = await groupMongoModel.findOneAndUpdate({_id: modelMongo._id}, {
            $set: group
        }, {
            new: true,
        });

        await transaction.commit();
        await session.commitTransaction();
        res.status(200).send({
            status: true,
            message: "Group updated successfully.",
            data: group,
            isUpdate: true
        });
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        await session.abortTransaction();
        res.status(400).send({
            status: false,
            message: "Something went wrong",
            error
        });
    } finally {
        session.endSession();
    }
}

export const deleteGroup = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    const session = await groupMongoModel.startSession();
    session.startTransaction();
    try {
        const { group_id, limit } = req.body;

        const modelGetSql = await groupSqlModel.findOne({
            where: {
                id: group_id
            }
        });

        const getModelMongo = await groupMongoModel.findOne({
            name: modelGetSql.name,
            limit
        });

        const modelMongo = await groupMongoModel.deleteOne({ 
            _id: getModelMongo._id,
        }, transaction);

        const modelMemberMongo = await memberMongoModel.deleteMany({ 
            group_id: getModelMongo._id,
        }, transaction);

        const modelSql = await groupSqlModel.destroy({
            where: {
                id: group_id
            }
        });

        const modelMemberSql = await memberSqlModel.destroy({
            where: {
                group_id: group_id
            }
        });


        await transaction.commit();
        await session.commitTransaction();
        res.status(200).send({
            status: true,
            message: "Chat Group deleted successfully.",
        });
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        await session.abortTransaction();
        res.status(400).send({
            status: false,
            message: "Something went wrong",
            error
        });
    } finally {
        session.endSession();
    }
}

export const getGroupMember = async (req, res, next) => {
    try {
        const {group_id} = req.body;

        const modelSql = await userSqlModel.findAll({
            where: {
                email: { [Op.notIn]: [req.session.user.email] }
            },
            attributes: ["id", "name", "email", "image", "password", "is_online", "lastSeenAt"],
            include: {
                model: memberSqlModel,
                as: "members",
                required: false, // required: true forces an INNER JOIN, use required: false to force a LEFT JOIN
                where: {
                    group_id: { [Op.eq]: group_id }
                },
                attributes: ["id", "group_id", "user_id"]
            }
            // include: ["members"]
        });

        const getGroupModel = await groupSqlModel.findOne({
            where: {
                id: group_id
            }
        });
        const getGroupModelMongo = await groupMongoModel.findOne({ name: getGroupModel.name });

        const modelMongo = await userMongoModel.aggregate([
            {
                $match: {
                    email: {
                        $nin: [req.session.user.email],
                    },
                },
            },
            {
                $lookup: {
                    from: "members",
                    // localField: "_id",
                    // foreignField: "user_id",
                    as: "members",
                    let: {
                        user_id: "$_id"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        // { $eq: ["$group_id", getGroupModelMongo._id] },
                                        { $eq: ["$user_id", "$$user_id"] },
                                        { group_id: getGroupModelMongo._id },
                                    ]
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        if (modelSql.length === 0 && modelMongo.length === 0) {
            throw "no member found";
        }
        res.status(200).send({
            status: true,
            message: "Group members found successfully.",
            data: modelSql
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            status: false,
            message: "Something went wrong",
            error
        });
    }
}

export const updateGroupMember = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    const session = await memberMongoModel.startSession();
    session.startTransaction();
    try {
        const { members, group_id, limit } = req.body;

        if (members.length > limit) {
            throw `You can't select more than ${limit} members`;
        }

        const getModelSql = await memberSqlModel.findAll({
            where: {
                group_id: group_id,
            }
        });

        if (getModelSql.length > 0) {
            await memberSqlModel.destroy({
                where: {
                    group_id: group_id,
                }
            });
        }

        const getUserModelSql = await userSqlModel.findAll({
            where: {
                id: { [Op.in]: members }
            },
            attributes: ["id", "name", "email", "image", "password", "is_online", "lastSeenAt"]
        });
        let memberSqlCreate = getUserModelSql.map(function (element) { return { group_id, user_id: element.id } });
        const modelSqlCreate = await memberSqlModel.bulkCreate(memberSqlCreate, { transaction });

        const getGroupModel = await groupSqlModel.findOne({
            where: {
                id: group_id
            }
        });
        const getGroupModelMongo = await groupMongoModel.findOne({ name: getGroupModel.name });
        const getModelMongo = await memberMongoModel.aggregate([
            {
                $match: {
                    group_id: {
                        $eq: getGroupModelMongo._id,
                    },
                },
            }
        ]);
        
        if (getModelMongo.length > 0) {
            await memberMongoModel.deleteMany({ group_id: getGroupModelMongo._id });
        }

        const newUsers = getUserModelSql.map(function (element) { return element.email });
        const modelMongo = await userMongoModel.aggregate([
            {
                $match: {
                    email: {
                        $in: newUsers,
                    },
                },
            }
        ]);

        let memberMongoCreate = modelMongo.map(function (element) { return { group_id: getGroupModelMongo._id, user_id: element._id } });
        const modelMongoCreate = await memberMongoModel.insertMany(memberMongoCreate);

        await transaction.commit();
        await session.commitTransaction();
        res.status(200).send({
            status: true,
            message: "Members added successfully.",
            data: modelSqlCreate
        });
    } catch (error) {
        await transaction.rollback();
        await session.abortTransaction();
        console.log(error);
        res.status(400).send({
            status: false,
            message: "Something went wrong",
            error
        });
    } finally {
        session.endSession();
    }
}

export const shareGroup = async (req, res, next) => {
    try {
        const { id } = req.params;

        const getGroupModelSql = await groupSqlModel.findOne({
            where: {
                id
            }
        });

        const getGroupModelMongo = await groupMongoModel.findOne({ name: getGroupModelSql.name });

        if (!getGroupModelSql || !getGroupModelMongo) {
            return res.render('error', {message: "404 Not Found!"});
        } else if (!req.session.user) {
            return res.render('error', {message: "You need to be logged in first to access this link."});
        } else {
            const countMemberSql = await memberSqlModel.count({
                where: {
                    group_id: {
                        [Op.eq]: id
                    }
                }
            });

            const availableSql = getGroupModelSql.limit - countMemberSql || 0;
            const countMemberMongo = await memberMongoModel.aggregate([
                { 
                    $match: { 
                        group_id: getGroupModelMongo._id 
                    } 
                },
                { 
                    $count: "count" 
                }
                // { $group: { _id: null, count: { $sum: 1 } } }
            ]);
            const availableMongo = getGroupModelMongo.limit - countMemberMongo[0] ? countMemberMongo[0].count : 0;

            const isOwner = getGroupModelSql.creator_id == req.session.user.id ? true : false;
            const isJoined = await memberSqlModel.count({
                where: {
                    [Op.and] : [
                        {
                            group_id: { [Op.eq]: id },
                        },
                        {
                            user_id: { [Op.eq]: req.session.user.id },
                        },
                    ]
                }
            });

            res.render('group-share', {group: getGroupModelSql, available: availableSql, totalMembers: countMemberSql, isOwner, isJoined, logout: "/v1/users/logout", page: "/group", auth: req.session.user ? true: false, url:"../v1/users/join-group"});
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({
            status: false,
            message: "Something went wrong",
            error
        });
    }
}

export const joinGroup = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    const session = await memberMongoModel.startSession();
    session.startTransaction();
    try {
        const { group_id } = req.body;
        const memberSql = {
            group_id,
            user_id: req.session.user.id
        };
        const ModelSql = await memberSqlModel.create(memberSql, { transaction });

        const getGroupModel = await groupSqlModel.findOne({
            where: {
                id: group_id
            }
        });
        const getGroupModelMongo = await groupMongoModel.findOne({ name: getGroupModel.name });
        const getMemberModelMongo = await userMongoModel.findOne({ email: req.session.user.email });
        const memberMongo = {
            group_id : getGroupModelMongo._id,
            user_id: getMemberModelMongo._id
        };
        const modelMongo = await memberMongoModel.create(memberMongo);

        await transaction.commit();
        await session.commitTransaction();
        res.status(200).send({
            status: true,
            message: "Congratulation, you have joined the group successfully",
            data: ModelSql
        });
    } catch (error) {
        await transaction.rollback();
        await session.abortTransaction();
        console.log(error);
        res.status(400).send({
            status: false,
            message: "Something went wrong",
            error
        });
    } finally {
        session.endSession();
    }
}

export const groupChatForm = async (req, res, next) => {
    try {
        const modelGroupSql = await groupSqlModel.findAll({
            where: {
                creator_id: req.session.user.id
            },
        });

        const modelJoinedGroupSql = await memberSqlModel.findAll({
            where: {
                user_id: req.session.user.id
            },
            include: {
                model: groupSqlModel,
                as: "group",
                required: false,
            }
        });

        const modelMongoUser = await userMongoModel.findOne({ email: req.session.user.email });

        const modelGroupMongo = await groupMongoModel.aggregate([
            {
                $match: {
                    creator_id: {
                        $eq: modelMongoUser._id,
                    }
                },
            }
        ]);

        const modelJoinedGroupMongo = await memberMongoModel.aggregate([
            {
                $match: {
                    user_id: {
                        $eq: modelMongoUser._id,
                    }
                },
            },
            {
                $lookup : {
                    from: "groups",
                    as: "group",
                    let: {
                        group_id: "$_id",
                    },
                    pipeline: [
                        {
                            $match:{
                                $expr: {
                                    $eq: ["$group_id", "$$group_id"]
                                }
                            }
                        },
                    ]
                }
            }
        ]);

        let data = {
            user: req.session.user,
            url: "/v1/users/group-chat",
            memberUrl: "/v1/users/group/members",
            logout: "/v1/users/logout",
            page: "/group-chat",
            auth: req.auth
        };
        
        if (modelGroupSql.length > 0 && modelGroupMongo.length > 0) {
            data.groups = modelGroupSql;
        } else {
            data.groups = "";
        }
            
        if (modelJoinedGroupSql.length > 0 && modelJoinedGroupMongo.length > 0) {
            data.joinedGroups = modelJoinedGroupSql;
        } else {
            data.joinedGroups = "";
        }
        res.render('group-chat', data);
    } catch (error) {
        console.log(error.message);
    }
}