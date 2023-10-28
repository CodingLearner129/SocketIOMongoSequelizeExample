import express from "express";
import * as UserController from "../../controllers/userController.js";
// import * as validatorMiddleware from "./../../middlewares/validator.js";
import {loggedInMiddleware} from "../../middlewares/authMiddleware.js"; 

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).render('index');
});

// router.get('/test', (req, res) => {
//     res.json({sucess: "maligyu"});
//     // res.status(200).render('index');
// });

// router.get('/load-test', (req, res) => {
//     for (let index = 0; index < 9000000000000000; index++) {
//     }
//     res.json({sucess: "finally maligyu"});
// });

router.get('/admin', (req, res) => {
    res.status(200).render('admin');
});

router.route('/group-share/:id').get([], UserController.shareGroup);

router.use(loggedInMiddleware);

// router.route('/register').get([validatorMiddleware.loggedIn], UserController.registerForm);

// router.route('/login').get([validatorMiddleware.loggedIn], UserController.loginForm);

// router.route('/dashboard').get([validatorMiddleware.loggedIn], UserController.dashboard);

// router.route('/group').get([validatorMiddleware.loggedIn], UserController.groupForm);

router.route('/register').get([], UserController.registerForm);

router.route('/login').get([], UserController.loginForm);

router.route('/dashboard').get([], UserController.dashboard);

router.route('/group').get([], UserController.groupForm);

router.route('/group-chat').get([], UserController.groupChatForm);

export {router};