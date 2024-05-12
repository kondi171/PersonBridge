import express, { Router } from "express";
import { getUser, sendMessage } from '../controllers/users.controller';

const router: Router = express.Router();

router.get('/v1/user/:id', getUser);

router.post('/v1/send', sendMessage);


export default router;