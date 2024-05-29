import express, { Router } from "express";
import { loginUser, registerUser } from '../controllers/authentication.controller';
const router: Router = express.Router();

router.post('/v1/authentication/login', loginUser);
router.put('/v1/authentication/register', registerUser);

export default router;