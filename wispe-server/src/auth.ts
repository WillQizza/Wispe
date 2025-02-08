import { genSalt, hash, compare } from 'bcrypt';
import { AUTH_PASSWORD_HASH_ROUNDS } from './config';

async function generatePasswordHash(password: string) {
    const salt = await genSalt(AUTH_PASSWORD_HASH_ROUNDS);
    const hashedPassword = await hash(password, salt);

    return hashedPassword;
}

function validatePassword({ password, passwordHash } : { password: string, passwordHash: string }) {
    return compare(password, passwordHash);
}

export {
    generatePasswordHash,
    validatePassword
};