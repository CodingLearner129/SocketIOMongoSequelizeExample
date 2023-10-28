import { Validator } from "node-input-validator";

export const getGroupMemberRequest = async (req, res, next) => {
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

export const updateGroupMemberRequest = async (req, res, next) => {
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