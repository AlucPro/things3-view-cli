import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'ink-testing-library';
import { App } from '../src/tui/App.js';

describe('App', () => {
  it('loads tasks for the selected project and switches projects with down arrow', async () => {
    const home = { id: 'home', title: 'Home' };
    const work = { id: 'work', title: 'Work' };
    const milk = { id: 'milk', title: 'Buy milk', tags: [], checklist: [], status: 'open' as const };
    const report = { id: 'report', title: 'Write report', tags: [], checklist: [], status: 'open' as const };
    const listOpenTasks = vi.fn((projectId?: string) => projectId === 'work' ? [report] : [milk]);
    const service = { listProjects: () => [home, work], listOpenTasks, complete: vi.fn() } as any;
    const ui = render(<App service={service} />);
    expect(ui.lastFrame()).toContain('Buy milk');
    ui.stdin.write('\u001B[B');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(ui.lastFrame()).toContain('Write report');
    expect(listOpenTasks).toHaveBeenLastCalledWith('work');
  });

  it('requires confirmation before completing the selected task', async () => {
    const task = { id: 'task-1', title: 'Buy milk', tags: [], checklist: [], status: 'open' as const };
    const service = { listProjects: () => [{ id: 'home', title: 'Home' }], listOpenTasks: () => [task], complete: vi.fn() } as any;
    const ui = render(<App service={service} />);
    ui.stdin.write('\t');
    await new Promise((resolve) => setTimeout(resolve, 0));
    ui.stdin.write('c');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(ui.lastFrame()).toContain('Complete Buy milk?');
    expect(service.complete).not.toHaveBeenCalled();
  });
});
