import { describe, expect, it } from 'vitest';
import { execa } from 'execa';

describe('td CLI', () => {
  it('prints help and version', async () => {
    const help = await execa('node', ['dist/index.js', '--help']);
    expect(help.stdout).toContain('Usage: td');

    const version = await execa('node', ['dist/index.js', '--version']);
    expect(version.stdout).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
