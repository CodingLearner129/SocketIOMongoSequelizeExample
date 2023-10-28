import mongoose from "mongoose";
import validator from "validator";


// create schema 
const userSchema = new mongoose.Schema({
    sender_id:{
        type: mongoose.Schema.ObjectId,
        ref: 'user', //name of the model
        required: [true, "Please enter the sender id"],
    },
    is_online: {
        type: Boolean,
        default: false,
        required: true
    }
},
{timestamps: true});

// create model
const user = mongoose.model("user", userSchema); //where "user" is model name which is used for relationship

export { user };