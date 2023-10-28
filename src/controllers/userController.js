import * as userService from "./../services/userService.js";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { Validator } from "node-input-validator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(path.join(__dirname, './../public/images'))) {
            fs.mkdirSync(path.join(__dirname, './../public/images'));
        }
        cb(null, path.join(__dirname, './../public/images'));
    },
    filename: function (req, file, cb) {
        const name = `${Date.now()}-${file.originalname}`;
        cb(null, name);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true); // cb(error, true/false); // To accept the file pass `true`
    } else {
        cb(new Error("Please enter valid image"), false); // cb(error, true/false); // To reject this file pass `false`
    }
}

const upload = multer({
    storage,
    fileFilter: multerFilter,
    onError: function (err, next) {
        next(err);
    }
});

export const uploadImage = (req, res, next) => {
    const uploadedImage = upload.single('image');
    uploadedImage(req, res, function (err) {
        if (err) {
            return res.status(200).json({
                status: false,
                message: err,
            });
        }
        next();
    });
}

export const registerForm = async (req, res, next) => {
    userService.registerForm(req, res, next);
};

export const register = async (req, res, next) => {
    userService.register(req, res, next);
};

export const loginForm = async (req, res, next) => {
    userService.loginForm(req, res, next);
};

export const login = async (req, res, next) => {
    userService.login(req, res, next);
};

export const logout = async (req, res, next) => {
    userService.logout(req, res, next);
};

export const dashboard = async (req, res, next) => {
    userService.dashboard(req, res, next);
};

export const groupForm = async (req, res, next) => {
    userService.groupForm(req, res, next);
};

export const groupChatForm = async (req, res, next) => {
    userService.groupChatForm(req, res, next);
};

export const group = async (req, res, next) => {
    userService.group(req, res, next);
};

export const updateGroup = async (req, res, next) => {
    userService.updateGroup(req, res, next);
};

export const deleteGroup = async (req, res, next) => {
    userService.deleteGroup(req, res, next);
};

export const getGroupMember = async (req, res, next) => {
    userService.getGroupMember(req, res, next);
};

export const updateGroupMember = async (req, res, next) => {
    userService.updateGroupMember(req, res, next);
};

export const shareGroup = async (req, res, next) => {
    userService.shareGroup(req, res, next);
};

export const joinGroup = async (req, res, next) => {
    userService.joinGroup(req, res, next);
};