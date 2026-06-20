import { describe, expect, it } from 'vitest';
import { renderTasks } from '../src/cli/render.js';

describe('renderTasks', () => {
  it('serializes a task as valid JSON without ANSI sequences', () => {
    const task = { id: 'task-1', title: 'Buy milk', tags: [], checklist: [], status: 'open' as const };
    const output = renderTasks([task], { json: true });
    expect(JSON.parse(output)).toEqual([expect.objectContaining({ id: task.id })]);
    expect(output).not.toMatch(/\x1b\[/);
  });
});
