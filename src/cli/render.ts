import type { ProjectView, TaskView } from '../domain/models.js';

export function renderProjects(items: ProjectView[], options: { json?: boolean } = {}): string {
  if (options.json) return JSON.stringify(items, null, 2);
  return items.length === 0 ? '没有项目。' : items.map((item) => `${item.id.slice(0, 8)}  ${item.title}${item.area ? `  [${item.area.title}]` : ''}`).join('\n');
}

export function renderTasks(items: TaskView[], options: { json?: boolean } = {}): string {
  if (options.json) return JSON.stringify(items, null, 2);
  return items.length === 0 ? '没有未完成事项。' : items.map((item) => {
    const checklist = item.checklist.length ? ` ${item.checklist.filter((x) => x.completed).length}/${item.checklist.length}` : '';
    const tags = item.tags.map((tag) => `#${tag.title}`).join(' ');
    return `${item.id.slice(0, 8)}  ${item.title}${item.project ? `  [${item.project.title}]` : ''}${tags ? `  ${tags}` : ''}${checklist}`;
  }).join('\n');
}

export function renderError(error: unknown): string { return error instanceof Error ? error.message : String(error); }
