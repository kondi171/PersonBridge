import express, { Router } from "express";
import { getUser } from '../controllers/users.controller';

const router: Router = express.Router();

router.get('/v1/access/user/:id', getUser);

export default router;