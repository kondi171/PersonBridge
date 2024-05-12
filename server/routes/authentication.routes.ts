import express, { Router } from "express";
import { loginUser, registerUser } from '../controllers/authentication.controller';
// logoutUser,
const router: Router = express.Router();

router.post('/v1/authentication/login', loginUser);

// router.post('/v1/authentication/logout', logoutUser);

router.put('/v1/authentication/register', registerUser);

export default router;