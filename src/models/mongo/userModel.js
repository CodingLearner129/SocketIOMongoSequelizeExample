import mongoose from "mongoose";
import validator from "validator";

// create schema 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the user name"],
        trim: true,
        minlength: [3, "The user must have at least 3 characters"],
        maxlength: [50, "The user must have less or equal then 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Please enter the email address"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email address"],
        minlength: [5, "The email must have at least 5 characters"],
        maxlength: [50, "The email must have less or equal then 50 characters"],
    },
    image: {
        type: String,
        required: [true, "Please enter user profile image"],
    },
    password: {
        type: String,
        required: [true, "Please enter the password"],
        minlength: [8, "The password must have at least 8 characters"],
        maxlength: [255, "The password must have less or equal then 255 characters"],
        select: false // to hide the createdAt from the response like passwords
    },
    is_online: {
        type: Boolean,
        default: false,
        required: true
    },
    lastSeenAt: {
        type: Date,
        required: false
    }
},
{timestamps: true});

// create model
const user = mongoose.model("user", userSchema); //where "user" is model name which is used for relationship

export { user };