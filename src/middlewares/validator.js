import { Validator } from "node-input-validator";
import fs from 'fs';

export const register = async (req, res, next) => {
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

export const login = async (req, res, next) => {
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

export const loggedIn = async (req, res, next) => {
    if (req.session.user) {
        req.auth = true;
        if (req.originalUrl == "/login" || req.originalUrl == "/register") {
            res.redirect("/dashboard");
        } else {
            next();            
        }
    } else {
        req.auth = false;
        if (req.originalUrl == "/login") {
            next();            
        } else if (req.originalUrl == "/register") {
            next();
        } else {
            res.redirect("/login");
        }
        // res.redirect("/login").status(401).send({
        //     status: false,
        //     message: "unauthorized access",
        //     error: {
        //         error: {
        //             message: "Unauthorized user"
        //         }
        //     }
        // });
    }
};

export const createGroup = async (req, res, next) => {
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

export const updateGroup = async (req, res, next) => {
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

export const getGroupMember = async (req, res, next) => {
    const validator = new Validator(req.body, {
        group_id: "required",
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

export const updateGroupMember = async (req, res, next) => {
    const validator = new Validator(req.body, {
        members: "required",
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