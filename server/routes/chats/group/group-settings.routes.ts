import express, { Router } from "express";
import { editGroupName, getGroupSettings, notifyAvatarChange, setIgnore, setMute, uploadAvatar, deleteAllGroupMessages, leaveGroup, addParticipants, removeParticipant } from "../../../controllers/chats/group/group-settings.controller";
import { uploadGroupAvatar } from "../../../middlewares/multer.middleware";

const router: Router = express.Router();

router.get('/v1/group/settings/:yourID/:groupID', getGroupSettings);

router.post('/v1/group/settings/avatar/:id', uploadGroupAvatar.single('avatar'), uploadAvatar);
router.post('/v1/group/settings/avatar', notifyAvatarChange);

router.patch('/v1/group/settings/name', editGroupName);

router.patch('/v1/group/settings/mute', setMute);
router.patch('/v1/group/settings/ignore', setIgnore);

router.post('/v1/group/settings/add', addParticipants)
router.delete('/v1/group/settings/remove', removeParticipant)

router.delete('/v1/group/settings/messages', deleteAllGroupMessages)
router.delete('/v1/group/settings/leave', leaveGroup);

export default router;