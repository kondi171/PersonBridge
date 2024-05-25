import express, { Router } from "express";

import { addReaction, forgetPIN, getGroupChat, getUserChat, markMessagesAsRead, sendMessageToUser, sendMessageToGroup } from '../controllers/chat.controller';

const router: Router = express.Router();

router.get('/v1/chat/user/:yourID/:friendID', getUserChat);
router.get('/v1/chat/group/:yourID/:groupID', getGroupChat);
router.post('/v1/chat/user/message', sendMessageToUser);
router.post('/v1/chat/group/message', sendMessageToGroup);
router.post('/v1/chat/mark', markMessagesAsRead);
router.post('/v1/chat/PIN', forgetPIN);
router.post('/v1/chat/reaction', addReaction);

export default router;