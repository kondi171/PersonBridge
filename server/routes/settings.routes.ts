import express, { Router } from "express";
import { editName, editLastname, editMail, editPassword, deleteMessages, deleteAccount } from '../controllers/settings.controller';

const router: Router = express.Router();

router.patch('/v1/settings/name', editName);
router.patch('/v1/settings/lastname', editLastname);
router.patch('/v1/settings/mail', editMail);
router.patch('/v1/settings/password', editPassword);

router.delete('/v1/settings/messages', deleteMessages);
router.delete('/v1/settings/account', deleteAccount);


export default router;