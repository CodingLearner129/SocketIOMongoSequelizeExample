import { Validator } from "node-input-validator";
import fs from 'fs';

export const loggedInMiddleware = async (req, res, next) => {
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