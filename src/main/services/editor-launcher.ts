import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { EditorLaunchResult, EditorTarget } from '@shared/types';

const execFileAsync = promisify(execFile);

const CLI_TARGETS: Record<Exclude<EditorTarget, 'terminal' | 'finder'>, string> = {
  cursor: 'cursor',
  claude: 'claude',
  codex: 'codex',
  zed: 'zed',
};

function targetLabel(target: EditorTarget): string {
  switch (target) {
    case 'claude':
      return 'Claude Code';
    case 'terminal':
      return 'Terminal';
    case 'finder':
      return 'Finder';
    default:
      return target;
  }
}

async function commandExists(command: string): Promise<boolean> {
  try {
    await execFileAsync('which', [command], { env: process.env });
    return true;
  } catch {
    return false;
  }
}

function spawnDetached(command: string, args: string[]): EditorLaunchResult {
  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  });
  child.unref();
  return { success: true, message: `Opened in ${command}` };
}

export async function loadShellPath(): Promise<void> {
  if (process.platform !== 'darwin') return;

  try {
    const shell = process.env.SHELL || '/bin/zsh';
    const { stdout } = await execFileAsync(shell, ['-lc', 'printf %s "$PATH"']);
    const shellPath = stdout.trim();

    if (!shellPath) return;

    const current = process.env.PATH ?? '';
    const merged = [...new Set([...shellPath.split(':'), ...current.split(':')])]
      .filter(Boolean)
      .join(':');
    process.env.PATH = merged;
  } catch {
    process.env.PATH = [
      process.env.PATH,
      '/opt/homebrew/bin',
      '/usr/local/bin',
      '/usr/bin',
      '/bin',
      '/usr/sbin',
      '/sbin',
    ].filter(Boolean).join(':');
  }
}

export async function openInEditor(
  target: EditorTarget,
  targetPath: string,
): Promise<EditorLaunchResult> {
  try {
    await access(targetPath);
  } catch {
    return { success: false, message: `Path does not exist: ${targetPath}` };
  }

  if (target === 'terminal') {
    if (process.platform !== 'darwin') {
      return { success: false, message: 'Terminal launcher is only supported on macOS' };
    }
    if (!(await commandExists('open'))) {
      return { success: false, message: 'open CLI not found on PATH' };
    }
    const result = spawnDetached('open', ['-a', 'Terminal', targetPath]);
    return { ...result, message: 'Opened in Terminal' };
  }

  if (target === 'finder') {
    if (process.platform !== 'darwin') {
      return { success: false, message: 'Finder launcher is only supported on macOS' };
    }
    if (!(await commandExists('open'))) {
      return { success: false, message: 'open CLI not found on PATH' };
    }
    const result = spawnDetached('open', [targetPath]);
    return { ...result, message: 'Revealed in Finder' };
  }

  const command = CLI_TARGETS[target];
  if (!(await commandExists(command))) {
    return {
      success: false,
      message: `${targetLabel(target)} CLI not found on PATH (expected '${command}')`,
    };
  }

  const result = spawnDetached(command, [targetPath]);
  return { ...result, message: `Opened in ${targetLabel(target)}` };
}
