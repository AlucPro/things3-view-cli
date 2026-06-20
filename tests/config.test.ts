import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from '../src/infrastructure/config.js';

describe('loadConfig', () => {
  it('uses an explicit database path and parses the read-only switch', () => {
    const config = loadConfig({
      THINGS_DB_PATH: '/tmp/things.sqlite',
      TD_READ_ONLY: 'true',
    });

    expect(config).toEqual({
      dbPath: '/tmp/things.sqlite',
      authToken: undefined,
      readOnly: true,
    });
  });

  it('fails when no database path can be resolved', () => {
    expect(() => loadConfig({ HOME: '/definitely-not-a-things-user' })).toThrow(ConfigError);
  });
});
