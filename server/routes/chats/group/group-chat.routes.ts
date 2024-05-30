import express, { Router } from "express";
import { addGroupReaction, getGroupChat, markGroupMessagesAsRead, sendMessageToGroup } from "../../../controllers/chats/group/group-chat.controller";

const router: Router = express.Router();

router.get('/v1/group/chat/:yourID/:groupID', getGroupChat);
router.post('/v1/group/chat/message', sendMessageToGroup);
router.post('/v1/group/chat/mark', markGroupMessagesAsRead);
router.post('/v1/group/chat/reaction', addGroupReaction);

export default router;