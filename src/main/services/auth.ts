import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { AuthStatus } from '@shared/types';

const execFileAsync = promisify(execFile);

let cachedToken: string | null = null;
let cachedUsername: string | null = null;

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;

  const ghToken = await getGhCliToken();
  if (ghToken) {
    cachedToken = ghToken;
    cachedUsername = await getGhUsername();
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

export async function getAuthStatus(): Promise<AuthStatus> {
  const token = await getToken();
  return {
    authenticated: !!token,
    username: cachedUsername,
    source: token ? 'gh-cli' : null,
  };
}

export function clearCache(): void {
  cachedToken = null;
  cachedUsername = null;
}
