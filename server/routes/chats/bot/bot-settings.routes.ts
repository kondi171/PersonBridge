import express, { Router } from "express";
import { deleteMessages, getChatbotSettings, removePIN, setNickname, setPIN } from "../../../controllers/chats/bot/bot-settings.controller";

const router: Router = express.Router();

router.get('/v1/bot/settings/:yourID/:chatbotID', getChatbotSettings);

router.patch('/v1/bot/settings/PIN', setPIN);
router.delete('/v1/bot/settings/PIN', removePIN);

router.patch('/v1/bot/settings/nickname', setNickname);

router.delete('/v1/bot/settings/messages', deleteMessages);

export default router;