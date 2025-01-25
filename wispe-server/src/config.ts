import { config } from 'dotenv';
config();

function requireEnv(name: string): string {
    if (!process.env[name]) {
        throw new Error(`Cannot start API server without environment variable: ${name}`);
    }

    return process.env[name] as string;
}

export const API_PORT = parseInt(requireEnv('API_PORT')) || 8000;
export const JWT_SECRET = requireEnv('JWT_SECRET');