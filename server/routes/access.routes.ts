import express, { Router } from "express";
import { getUser } from '../controllers/access.controller';
import { authenticateToken } from "../middlewares/jwt.middleware";
import { getUserFriendsWithMessages } from "../controllers/access.controller";

const router: Router = express.Router();

router.get('/v1/access/user/:id', getUser);
router.get('/v1/access/friends/:id', getUserFriendsWithMessages);

// router.get('/v1/access/user/:id', authenticateToken, getUser);

export default router;