import { safeStorage } from 'electron';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import type { AuthStatus } from '@shared/types';

const execFileAsync = promisify(execFile);

let cachedToken: string | null = null;
let cachedUsername: string | null = null;
let authSource: 'gh-cli' | 'manual' | null = null;

const TOKEN_FILE = () => path.join(app.getPath('userData'), '.gh-token');

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;

  // Try gh CLI first
  const ghToken = await getGhCliToken();
  if (ghToken) {
    cachedToken = ghToken;
    authSource = 'gh-cli';
    cachedUsername = await getGhUsername();
    return cachedToken;
  }

  // Try stored manual token
  const manualToken = await getStoredToken();
  if (manualToken) {
    cachedToken = manualToken;
    authSource = 'manual';
    return cachedToken;
  }

  return null;
}

async function getGhCliToken(): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('gh', ['auth', 'token'], {
      timeout: 5000,
    });
    const token = stdout.trim();
    return token || null;
  } catch {
    return null;
  }
}

async function getGhUsername(): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('gh', ['api', 'user', '--jq', '.login'], {
      timeout: 5000,
    });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

async function getStoredToken(): Promise<string | null> {
  try {
    const tokenFile = TOKEN_FILE();
    if (!fs.existsSync(tokenFile)) return null;
    const encrypted = fs.readFileSync(tokenFile);
    return safeStorage.decryptString(encrypted);
  } catch {
    return null;
  }
}

export async function setManualToken(token: string): Promise<void> {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption not available');
  }
  const encrypted = safeStorage.encryptString(token);
  const tokenFile = TOKEN_FILE();
  fs.mkdirSync(path.dirname(tokenFile), { recursive: true });
  fs.writeFileSync(tokenFile, encrypted);
  cachedToken = token;
  authSource = 'manual';
  cachedUsername = null; // Will be fetched on next poll
}

export async function getAuthStatus(): Promise<AuthStatus> {
  const token = await getToken();
  return {
    authenticated: !!token,
    username: cachedUsername,
    source: authSource,
  };
}

export function clearCache(): void {
  cachedToken = null;
  cachedUsername = null;
  authSource = null;
}
