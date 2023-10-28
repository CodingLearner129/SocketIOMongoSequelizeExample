import sequelize from './../../config/database.sql.js';
import { User as userSqlModel } from "./userModel.js";
import { Group as groupSqlModel } from "./groupModel.js";
import { Member as memberSqlModel } from "./memberModel.js";
import { GroupChat as groupChatSqlModel } from "./groupChatModel.js";

// groupSqlModel.belongsToMany(userSqlModel, {
//     through: 'members'
// });

// userSqlModel.belongsTo(memberSqlModel, {
//     foreignKey: 'id'
// });

// userSqlModel.belongsToMany(groupSqlModel, {
//     through: 'members'
// });

userSqlModel.hasMany(memberSqlModel, {
    foreignKey: 'user_id',
    // as: "members"
});

userSqlModel.hasMany(groupChatSqlModel, {
    foreignKey: 'sender_id',
    // as: "members"
});

groupSqlModel.hasMany(memberSqlModel, {
    foreignKey: 'group_id',
    // as: "members"
});

memberSqlModel.belongsTo(userSqlModel, {
    foreignKey: 'user_id',
    // as: "user"
});

memberSqlModel.belongsTo(groupSqlModel, {
    foreignKey: 'group_id',
    // as: "group"
});

groupChatSqlModel.belongsTo(groupSqlModel, {
    foreignKey: 'group_id',
    // as: "group"
});

groupChatSqlModel.belongsTo(userSqlModel, {
    foreignKey: 'sender_id',
    // as: "group"
});

await sequelize.sync(); // force: true - This creates the table, dropping it first if it already existed
// await sequelize.sync({alter: true}); //alter: true - This checks what is the current state of the table in the database (which columns it has, what are their data types, etc), and then performs the necessary changes in the table to make it match the model.
console.log("All models were synchronized successfully.");