import mongoose from "mongoose";
import validator from "validator";

// create schema 
const memberSchema = new mongoose.Schema({
    group_id:{
        type: mongoose.Schema.ObjectId,
        ref: 'group', //name of the model
        required: [true, "Please enter the group id"],
    },
    user_id:{
        type: mongoose.Schema.ObjectId,
        ref: 'user', //name of the model
        required: [true, "Please enter the user id"],
    },
},
{timestamps: true});

// create model
const member = mongoose.model("member", memberSchema); //where "user" is model name which is used for relationship

export { member };