import { Validator } from "node-input-validator";
import fs from 'fs';
import { log } from "console";

export const createGroupRequest = async (req, res, next) => {
    const validator = new Validator(req.body, {
        name: "required|string",
        limit: "required|integer",
    });
    const matched = await validator.check();
    if (!matched || !req.file) {
        if (!req.file) {
            validator.errors.image = {
                message: "The image field is mandatory."
            }
        } else {
            fs.unlinkSync(`${req.file.destination}/${req.file.filename}`);
        }
        res.status(422).send({
            status: false,
            message: "Validation Error",
            error: validator.errors
        });
    } else {
        next();
    }
};

export const updateGroupRequest = async (req, res, next) => {
    const validator = new Validator(req.body, {
        name: "required|string",
        limit: "required|integer",
    });
    const matched = await validator.check();
    if (!matched) {
        res.status(422).send({
            status: false,
            message: "Validation Error",
            error: validator.errors
        });
    } else {
        next();
    }
};

export const deleteGroupRequest = async (req, res, next) => {
    const validator = new Validator(req.body, {
        group_id: "required",
        limit: "required",
    });
    const matched = await validator.check();
    if (!matched) {
        res.status(422).send({
            status: false,
            message: "Validation Error",
            error: validator.errors
        });
    } else {
        next();
    }
};