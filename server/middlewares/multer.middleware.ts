import path from 'path';
import multer, { DiskStorageOptions, FileFilterCallback } from 'multer';
import { Request, Response } from 'express';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'resources/avatars');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const userId = req.params.id;
        if (!userId) {
            return cb(new Error('User ID is missing'), '');
        }
        cb(null, `${userId}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
        callback(null, true);
    },
    limits: {
        fileSize: 52428800 // Ustawienie limitu na 50MB
    }
});

export default upload;