import { User } from "../src/models/user";
import { generatePasswordHash, signJWT } from "../src/util/auth";

let userId = 0;

async function createRandomUser({ isAdmin } : { isAdmin: boolean }) {
    const user = await createUser({
        username: `user${userId}`,
        displayName: `user${userId}`,
        password: `user${userId}`,
        isAdmin
    });

    userId++;
    return user;
}

async function createUser({ username, displayName, password, isAdmin } : { username: string, displayName: string, password: string, isAdmin: boolean }) {
    const user = await User.create({
        username,
        displayName,
        passwordHash: await generatePasswordHash(password),
        changePasswordRequested: false,
        admin: isAdmin
    });

    const jwt = (await signJWT({
        id: user.id
    })) as string;

    return {
        username,
        password,
        jwt
    };
}

export {
    createRandomUser,
    createUser
};