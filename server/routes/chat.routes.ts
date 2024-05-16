import express, { Router } from "express";

import { getUserChat, sendMessage } from '../controllers/chat.controller';

const router: Router = express.Router();

router.get('/v1/chat/:yourID/:friendID', getUserChat);
router.post('/v1/chat/message', sendMessage);


export default router;