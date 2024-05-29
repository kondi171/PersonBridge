import express, { Router } from "express";
import { deleteMessages, getFriendSettings, removeFriend, removePIN, setBlock, setIgnore, setMute, setNickname, setPIN } from "../../../controllers/chats/user/user-settings.controller";

const router: Router = express.Router();

router.get('/v1/user/settings/:yourID/:friendID', getFriendSettings);

router.patch('/v1/user/settings/mute', setMute);
router.patch('/v1/user/settings/ignore', setIgnore);
router.patch('/v1/user/settings/block', setBlock);

router.patch('/v1/user/settings/PIN', setPIN);
router.delete('/v1/user/settings/PIN', removePIN);

router.patch('/v1/user/settings/nickname', setNickname);

router.delete('/v1/user/settings/messages', deleteMessages);
router.delete('/v1/user/settings/friend', removeFriend);

export default router;