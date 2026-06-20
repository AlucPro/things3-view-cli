import { describe, expect, it } from 'vitest';
import { ThingsSqliteRepository } from '../src/infrastructure/things-repository.js';
import { createFixtureDb } from './helpers/create-fixture-db.js';

describe('ThingsSqliteRepository', () => {
  it('aggregates checklist items and tags without duplicating a task', () => {
    const fixture = createFixtureDb();
    const repository = new ThingsSqliteRepository(fixture.path);
    const tasks = repository.listOpenTasks();

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      id: fixture.taskId,
      title: 'Buy milk',
      checklist: [{ title: 'Check fridge', completed: false }],
      tags: [{ title: 'Errands' }],
    });
    repository.close();
  });
});
