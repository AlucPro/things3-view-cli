import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'ink-testing-library';
import { App } from '../src/tui/App.js';

describe('App', () => {
  it('requires confirmation before completing the selected task', async () => {
    const task = { id: 'task-1', title: 'Buy milk', tags: [], checklist: [], status: 'open' as const };
    const service = { listProjects: () => [], listOpenTasks: () => [task], complete: vi.fn() } as any;
    const ui = render(<App service={service} />);
    ui.stdin.write('c');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(ui.lastFrame()).toContain('Complete Buy milk?');
    expect(service.complete).not.toHaveBeenCalled();
  });
});
