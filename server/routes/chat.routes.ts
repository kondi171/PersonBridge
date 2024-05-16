import express, { Router } from "express";

import { getFriend, getUserChat, insertMessages } from '../controllers/chat.controller';

const router: Router = express.Router();

router.get('/v1/chat/friend/:id', getFriend);
router.get('/v1/chat/:yourID/:friendID', getUserChat);
router.post('/v1/chat/insert-messages/:id', insertMessages);

export default router;