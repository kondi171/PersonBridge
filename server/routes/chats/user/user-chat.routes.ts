import express, { Router } from "express";
import { addUserReaction, forgetPIN, getUserChat, markMessagesAsRead, sendMessageToUser } from "../../../controllers/chats/user/user-chat.controller";

const router: Router = express.Router();

router.get('/v1/user/chat/:yourID/:friendID', getUserChat);
router.post('/v1/user/chat/message', sendMessageToUser);
router.post('/v1/user/chat/mark', markMessagesAsRead);
router.post('/v1/user/chat/PIN', forgetPIN);
router.post('/v1/user/chat/reaction', addUserReaction);

export default router;