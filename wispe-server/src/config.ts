import { config } from 'dotenv';
config();

function requireEnv(name: string): string {
    if (!process.env[name]) {
        throw new Error(`Cannot start API server without environment variable: ${name}`);
    }

    return process.env[name] as string;
}

export const API_PORT = parseInt(requireEnv('API_PORT'));
export const JWT_SECRET = requireEnv('JWT_SECRET');

export const POSTGRES_USERNAME = requireEnv('POSTGRES_USERNAME');
export const POSTGRES_PASSWORD = requireEnv('POSTGRES_PASSWORD');
export const POSTGRES_HOST = requireEnv('POSTGRES_HOST');
export const POSTGRES_PORT = parseInt(requireEnv('POSTGRES_PORT'));
export const POSTGRES_DATABASE = requireEnv('POSTGRES_DATABASE');
export const AUTH_PASSWORD_HASH_ROUNDS = parseInt(requireEnv('AUTH_PASSWORD_HASH_ROUNDS'));