import { question } from 'readline-sync';
import { User } from './models/user';
import { generatePasswordHash } from './auth';

async function requiresAdminSetup() {
    return (await User.count()) === 0;   
};

async function firstTimeServerCheck() {
    // Check if we need admin setup
    const doSetup = await requiresAdminSetup();
    if (!doSetup) {
        return;
    }

    console.log('First time setup detected. Please provide some details for your administrator account.');
    let username = '';
    let password = '';
    let displayName = '';

    while (username.length === 0) {
        username = question('Username: ');
    }

    while (displayName.length === 0) {
        displayName = question('Display Name: ');
    }

    while (password.length === 0) {
        password = question('Password: ', {  hideEchoBack: true });
    }

    const passwordHash = await generatePasswordHash(password);

    await User.create({
        username,
        displayName,
        passwordHash,
        changePasswordRequested: false,
        admin: true
    });

    console.log('Admin account created! Thanks and welcome to Wispe!');
};

export {
    firstTimeServerCheck
};
