import express, { Router } from "express";
import { getFriendSettings, setBlock, setIgnore, setMute } from "../controllers/chat-settings.controller";

const router: Router = express.Router();

router.get('/v1/chat-settings/:yourID/:friendID', getFriendSettings);
router.patch('/v1/chat-settings/mute', setMute);
router.patch('/v1/chat-settings/ignore', setIgnore);
router.patch('/v1/chat-settings/block', setBlock);

export default router