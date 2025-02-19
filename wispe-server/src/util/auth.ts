import { genSalt, hash, compare } from 'bcrypt';
import { AUTH_PASSWORD_HASH_ROUNDS, JWT_BASE64_SECRET, JWT_EXPIRY_SECONDS } from '../config';
import jwt from 'jsonwebtoken';
import { resolve } from 'path';

async function generatePasswordHash(password: string) {
    const salt = await genSalt(AUTH_PASSWORD_HASH_ROUNDS);
    const hashedPassword = await hash(password, salt);

    return hashedPassword;
}

function validatePassword({ password, passwordHash } : { password: string, passwordHash: string }) {
    return compare(password, passwordHash);
}

function signJWT(data: object) {
    return new Promise((res, rej) => {
        const signingKey = Buffer.from(JWT_BASE64_SECRET, 'base64');
    
        jwt.sign(data, signingKey, { algorithm: 'HS512', expiresIn: JWT_EXPIRY_SECONDS }, (err, token) => {
            if (err != null) {
                rej(err);
                return;
            }

            res(token as string);
        });
    
    });
}

export {
    generatePasswordHash,
    validatePassword,
    signJWT
};