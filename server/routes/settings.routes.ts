import express, { Router } from "express";
import { uploadUserAvatar } from "../middlewares/multer.middleware";
import { editName, editLastname, editMail, editPassword, deleteMessages, deleteAccount, uploadAvatar } from '../controllers/settings.controller';

const router: Router = express.Router();

router.post('/v1/settings/avatar/:id', uploadUserAvatar.single('avatar'), uploadAvatar);

router.patch('/v1/settings/name', editName);
router.patch('/v1/settings/lastname', editLastname);
router.patch('/v1/settings/mail', editMail);
router.patch('/v1/settings/password', editPassword);

router.delete('/v1/settings/messages', deleteMessages);
router.delete('/v1/settings/account', deleteAccount);


export default router;