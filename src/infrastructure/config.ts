import { config as loadDotenv } from 'dotenv';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export type ThingsConfig = {
  dbPath: string;
  authToken?: string;
  readOnly: boolean;
};

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

function isFile(path: string): boolean {
  try {
    return existsSync(path) && statSync(path).isFile();
  } catch {
    return false;
  }
}

function findDefaultDatabase(home: string | undefined): string | undefined {
  if (!home) return undefined;

  const container = join(
    home,
    'Library',
    'Group Containers',
    'JLMPQHK86H.com.culturedcode.ThingsMac',
  );
  const direct = join(container, 'Things Database.thingsdatabase', 'main.sqlite');
  if (isFile(direct)) return direct;

  if (!existsSync(container)) return undefined;
  const candidates = readdirSync(container, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('ThingsData-'))
    .map((entry) => join(container, entry.name, 'Things Database.thingsdatabase', 'main.sqlite'))
    .filter(isFile);

  return candidates.length === 1 ? candidates[0] : undefined;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ThingsConfig {
  loadDotenv({ quiet: true });
  const dbPath = env.THINGS_DB_PATH?.trim() || findDefaultDatabase(env.HOME ?? process.env.HOME);
  if (!dbPath) {
    throw new ConfigError('未找到 Things 数据库；请设置 THINGS_DB_PATH。');
  }

  const authToken = env.THINGS_AUTH_TOKEN?.trim() || undefined;
  return { dbPath, authToken, readOnly: env.TD_READ_ONLY?.trim().toLowerCase() === 'true' };
}
