import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const userAvatarsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'resources/users/avatars');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const userID = req.params.id;
        if (!userID) {
            return cb(new Error('User ID is missing'), '');
        }
        cb(null, `${userID}${ext}`);
    }
});

const groupAvatarsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'resources/groups/avatars');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const groupID = req.params.id;
        if (!groupID) {
            return cb(new Error('Group ID is missing'), '');
        }
        cb(null, `${groupID}${ext}`);
    }
});

export const uploadUserAvatar = multer({
    storage: userAvatarsStorage,
    fileFilter: (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
        callback(null, true);
    },
    limits: {
        fileSize: 52428800 // set limit to 50 MB
    }
});

export const uploadGroupAvatar = multer({
    storage: groupAvatarsStorage,
    fileFilter: (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
        callback(null, true);
    },
    limits: {
        fileSize: 52428800 // set limit to 50 MB
    }
});
