import mongoose from "mongoose";
import validator from "validator";

// create schema 
const groupChatSchema = new mongoose.Schema({
    sender_id:{
        type: mongoose.Schema.ObjectId,
        ref: 'user', //name of the model
        required: [true, "Please enter the sender id"],
    },
    group_id:{
        type: mongoose.Schema.ObjectId,
        ref: 'group', //name of the model
        required: [true, "Please enter the group id"],
    },
    message:{
        type: String,
        required: [true, "Please enter the message"],
    }
},
{timestamps: true});

// create model
const groupChat = mongoose.model("group_chat", groupChatSchema); //where "chat" is model name which is used for relationship

export { groupChat };