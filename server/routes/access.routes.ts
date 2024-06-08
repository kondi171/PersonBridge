import express, { Router } from "express";
import { changeUserStatus, createGroup, getUser, getUserFriendsAndGroupsWithMessages, getUserStatus, uploadAvatar } from '../controllers/access.controller';
import { getFriends } from "../controllers/access.controller";
import { uploadGroupAvatar } from "../middlewares/multer.middleware";

const router: Router = express.Router();

router.get('/v1/access/user/:id', getUser);
router.patch('/v1/access/status', changeUserStatus);
router.get('/v1/access/status/:id', getUserStatus);
router.get('/v1/access/group/:id', getFriends);
router.post('/v1/access/group', createGroup);
router.post('/v1/access/group/:id', uploadGroupAvatar.single('avatar'), uploadAvatar);
router.get('/v1/access/friends-and-groups/:id', getUserFriendsAndGroupsWithMessages);

export default router;