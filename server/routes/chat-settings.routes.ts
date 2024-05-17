import express, { Router } from "express";
import { deleteMessages, getFriendSettings, removeFriend, removePIN, setBlock, setIgnore, setMute, setNickname, setPIN } from "../controllers/chat-settings.controller";

const router: Router = express.Router();

router.get('/v1/chat-settings/:yourID/:friendID', getFriendSettings);

router.patch('/v1/chat-settings/mute', setMute);
router.patch('/v1/chat-settings/ignore', setIgnore);
router.patch('/v1/chat-settings/block', setBlock);

router.patch('/v1/chat-settings/PIN', setPIN);
router.delete('/v1/chat-settings/PIN', removePIN);

router.patch('/v1/chat-settings/nickname', setNickname);

router.delete('/v1/chat-settings/messages', deleteMessages);
router.delete('/v1/chat-settings/friend', removeFriend);

export default router