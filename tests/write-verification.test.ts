import { describe, expect, it, vi } from 'vitest';
import { ThingsService } from '../src/application/things-service.js';

describe('write verification', () => {
  it('reports dispatched but unverified when the task remains open', async () => {
    const task = { id: 'task-1', title: 'Buy milk', tags: [], checklist: [], status: 'open' as const };
    const writer = { add: vi.fn(), complete: vi.fn(), cancel: vi.fn() };
    const repository = { listProjects: () => [], listOpenTasks: () => [task], findOpenTaskById: () => task, findProjectsByExactIdOrName: () => [] };
    const service = new ThingsService(repository, writer);

    await expect(service.complete(task.id, { verify: true, delays: [0] })).resolves.toEqual({ state: 'unverified' });
    expect(writer.complete).toHaveBeenCalledWith(task.id);
  });
});
