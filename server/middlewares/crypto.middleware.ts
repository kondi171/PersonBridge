import crypto from 'crypto';

export const generateSecretKey = (length: number) => {
    return crypto.randomBytes(length).toString('hex');
}