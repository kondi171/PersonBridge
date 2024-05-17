import express, { Router } from "express";

import { forgetPIN, getUserChat, markMessagesAsRead, sendMessage } from '../controllers/chat.controller';

const router: Router = express.Router();

router.get('/v1/chat/:yourID/:friendID', getUserChat);
router.post('/v1/chat/message', sendMessage);
router.post('/v1/chat/mark', markMessagesAsRead);
router.post('/v1/chat/PIN', forgetPIN);
export default router;