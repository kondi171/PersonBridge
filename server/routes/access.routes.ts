import express, { Router } from "express";
import { createGroup, getUser, getUserFriendsAndGroupsWithMessages, getUserGroupsWithMessages, uploadAvatar } from '../controllers/access.controller';
import { getUserFriendsWithMessages, getFriends } from "../controllers/access.controller";
import { uploadGroupAvatar } from "../middlewares/multer.middleware";

const router: Router = express.Router();

router.get('/v1/access/user/:id', getUser);
router.get('/v1/access/friends/:id', getUserFriendsWithMessages);
router.get('/v1/access/groups/:id', getUserGroupsWithMessages);
router.get('/v1/access/group/:id', getFriends);
router.post('/v1/access/group', createGroup);
router.post('/v1/access/group/:id', uploadGroupAvatar.single('avatar'), uploadAvatar);
router.get('/v1/access/friends-and-groups/:id', getUserFriendsAndGroupsWithMessages);
export default router;