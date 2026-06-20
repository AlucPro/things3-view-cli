import { describe, expect, it } from 'vitest';
import { ThingsService } from '../src/application/things-service.js';

describe('ThingsService', () => {
  it('rejects an ambiguous project title with candidate ids', () => {
    const repository = { listProjects: () => [{ id: 'a', title: 'Home' }, { id: 'b', title: 'Home' }] } as any;
    const service = new ThingsService(repository, {} as any);

    expect(() => service.resolveProject('Home')).toThrow(/a.*b/);
  });
});
