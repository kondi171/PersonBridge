import express, { Router } from "express";
import { getChatbots, addChatbotToUser, addChatbotToCollection } from "../controllers/chatbots.controller";

const router: Router = express.Router();

router.get('/v1/chatbots', getChatbots);
router.post('/v1/chatbots/add', addChatbotToUser);
router.post('/v1/chatbots/add-to-collection', addChatbotToCollection);

export default router;