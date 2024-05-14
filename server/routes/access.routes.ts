import express, { Router } from "express";
import { getUser } from '../controllers/users.controller';
import { authenticateToken } from "../middlewares/jwt.middleware";

const router: Router = express.Router();

router.get('/v1/access/user/:id', getUser);
// router.get('/v1/access/user/:id', authenticateToken, getUser);

export default router;