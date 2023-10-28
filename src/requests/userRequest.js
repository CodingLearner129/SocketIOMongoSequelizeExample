import { Validator } from "node-input-validator";
import fs from 'fs';

export const registerRequest = async (req, res, next) => {
    const validator = new Validator(req.body, {
        name: "required|string",
        email: "required|email|string",
        password: "required",
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

export const loginRequest = async (req, res, next) => {
    const validator = new Validator(req.body, {
        email: "required|email|string",
        password: "required",
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