import type { ThingsWriter } from '../application/things-service.js';

type Options = { open: (url: string) => void | Promise<void>; authToken?: string };

export class ThingsUrlGateway implements ThingsWriter {
  constructor(private readonly options: Options) {}
  buildCompleteUrl(taskId: string): string { return this.buildUpdate(taskId, 'completed'); }
  buildCancelUrl(taskId: string): string { return this.buildUpdate(taskId, 'canceled'); }
  redact(url: string): string { return url.replace(/([?&]auth-token=)[^&]*/u, '$1[REDACTED]'); }
  async add(input: { title: string; notes?: string; projectId?: string; when?: string; deadline?: string; tags?: string[] }): Promise<void> {
    const params = new URLSearchParams({ title: input.title });
    if (input.notes) params.set('notes', input.notes); if (input.projectId) params.set('list-id', input.projectId); if (input.when) params.set('when', input.when); if (input.deadline) params.set('deadline', input.deadline); if (input.tags?.length) params.set('tags', input.tags.join(','));
    await this.options.open(`things:///add?${params}`);
  }
  async complete(taskId: string): Promise<void> { await this.options.open(this.buildCompleteUrl(taskId)); }
  async cancel(taskId: string): Promise<void> { await this.options.open(this.buildCancelUrl(taskId)); }
  private buildUpdate(id: string, field: 'completed' | 'canceled'): string {
    if (!this.options.authToken) throw new Error('缺少 THINGS_AUTH_TOKEN；请在 Things 设置中启用 Things URLs。');
    return `things:///update?${new URLSearchParams({ id, [field]: 'true', 'auth-token': this.options.authToken })}`;
  }
}
