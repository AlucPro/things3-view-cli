import type { ProjectView, TaskView } from '../domain/models.js';

export interface ThingsRepository {
  listProjects(): ProjectView[];
  listOpenTasks(projectId?: string): TaskView[];
  findOpenTaskById(id: string): TaskView | undefined;
  findProjectsByExactIdOrName(query: string): ProjectView[];
}

export interface ThingsWriter {
  add(input: { title: string; notes?: string; projectId?: string; when?: string; deadline?: string; tags?: string[] }): Promise<void>;
  complete(taskId: string): Promise<void>;
  cancel(taskId: string): Promise<void>;
}

export class NotFoundError extends Error {}
export class AmbiguousProjectError extends Error {}

export class ThingsService {
  constructor(private readonly repository: ThingsRepository, readonly writer: ThingsWriter) {}
  listProjects() { return this.repository.listProjects(); }
  resolveProject(query: string): ProjectView {
    const matches = this.repository.findProjectsByExactIdOrName?.(query) ?? this.repository.listProjects().filter((p) => p.id === query || p.title.toLowerCase() === query.toLowerCase());
    if (matches.length === 0) throw new NotFoundError(`未找到项目: ${query}`);
    if (matches.length > 1) throw new AmbiguousProjectError(`项目名称不唯一: ${matches.map((p) => `${p.title} (${p.id})`).join(', ')}`);
    return matches[0]!;
  }
  listOpenTasks(projectQuery?: string) { return this.repository.listOpenTasks(projectQuery ? this.resolveProject(projectQuery).id : undefined); }
  getOpenTaskForMutation(id: string) { const task = this.repository.findOpenTaskById(id); if (!task) throw new NotFoundError(`未找到未完成事项: ${id}`); return task; }
  async add(input: Parameters<ThingsWriter['add']>[0]): Promise<void> { await this.writer.add(input); }
  async complete(id: string, options: { verify?: boolean; delays?: number[] } = {}): Promise<{ state: 'verified' | 'unverified' }> {
    this.getOpenTaskForMutation(id); await this.writer.complete(id); return this.verify(id, options);
  }
  async cancel(id: string, options: { verify?: boolean; delays?: number[] } = {}): Promise<{ state: 'verified' | 'unverified' }> {
    this.getOpenTaskForMutation(id); await this.writer.cancel(id); return this.verify(id, options);
  }
  private async verify(id: string, options: { verify?: boolean; delays?: number[] }): Promise<{ state: 'verified' | 'unverified' }> {
    if (!options.verify) return { state: 'unverified' };
    for (const delay of options.delays ?? [150, 300, 600]) { if (delay) await new Promise((resolve) => setTimeout(resolve, delay)); if (!this.repository.findOpenTaskById(id)) return { state: 'verified' }; }
    return { state: 'unverified' };
  }
}
