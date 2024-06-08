import express, { Router } from "express";
import { getChatbot, getChatbotReply, sendMessageToChatbot } from "../../../controllers/chats/bot/bot-chat.controller";

const router: Router = express.Router();

router.get('/v1/bot/chat/:yourID/:chatbotID', getChatbot);
router.post('/v1/bot/chat/send', sendMessageToChatbot);
router.post('/v1/bot/chat/reply', getChatbotReply);

export default router;