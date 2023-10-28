import express from 'express';
import * as UserController from "../../controllers/userController.js";
// import * as validatorMiddleware from "./../../middlewares/validator.js"; 
import { loggedInMiddleware } from "./../../middlewares/authMiddleware.js";
import { registerRequest, loginRequest } from "./../../requests/userRequest.js";
import { createGroupRequest, updateGroupRequest, deleteGroupRequest } from "./../../requests/groupRequest.js";
import { getGroupMemberRequest, updateGroupMemberRequest } from "./../../requests/groupMemberRequest.js";

const router = express.Router();

// router.route('/register').post([UserController.uploadImage, validatorMiddleware.register], UserController.register);
router.route('/register').post([UserController.uploadImage, registerRequest], UserController.register);

// router.route('/login').post([validatorMiddleware.login], UserController.login);
router.route('/login').post([loginRequest], UserController.login);

router.route('/join-group').post([], UserController.joinGroup);

// router.use(validatorMiddleware.loggedIn);
router.use(loggedInMiddleware);

router.route('/logout').get([], UserController.logout);

// router.route('/group').post([UserController.uploadImage, validatorMiddleware.createGroup], UserController.group).patch([UserController.uploadImage, validatorMiddleware.updateGroup], UserController.updateGroup);
router.route('/group').post([UserController.uploadImage, createGroupRequest], UserController.group).patch([UserController.uploadImage, updateGroupRequest], UserController.updateGroup).delete([deleteGroupRequest], UserController.deleteGroup);

// router.route('/group/members').post([validatorMiddleware.getGroupMember], UserController.getGroupMember).put([validatorMiddleware.updateGroupMember], UserController.updateGroupMember);
router.route('/group/members').post([getGroupMemberRequest], UserController.getGroupMember).put([updateGroupMemberRequest], UserController.updateGroupMember);


export { router };