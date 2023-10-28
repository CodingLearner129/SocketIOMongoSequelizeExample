import mongoose from "mongoose";
import validator from "validator";

// create schema 
const groupSchema = new mongoose.Schema({
    creator_id:{
        type: mongoose.Schema.ObjectId,
        ref: 'user', //name of the model
        required: [true, "Please enter the creator id"],
    },
    name: {
        type: String,
        required: [true, "Please enter the group name"],
        trim: true,
        unique: true,
        minlength: [3, "The group must have at least 3 characters"],
        maxlength: [50, "The group must have less or equal then 50 characters"],
    },
    image: {
        type: String,
        required: [true, "Please enter user profile image"],
    },
    limit: {
        type: Number,
        required: [true, "Please enter group members limit"],
    }
},
{timestamps: true});

// create model
const group = mongoose.model("group", groupSchema); //where "user" is model name which is used for relationship

export { group };