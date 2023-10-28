import mongoose from "mongoose";
import validator from "validator";

// create schema 
const chatSchema = new mongoose.Schema({
    sender_id:{
        type: mongoose.Schema.ObjectId,
        ref: 'user', //name of the model
        required: [true, "Please enter the sender id"],
    },
    receiver_id:{
        type: mongoose.Schema.ObjectId,
        ref: 'user', //name of the model
        required: [true, "Please enter the receiver id"],
    },
    message:{
        type: String,
        required: [true, "Please enter the message"],
    }
},
{timestamps: true});

// create model
const chat = mongoose.model("chat", chatSchema); //where "chat" is model name which is used for relationship

export { chat };