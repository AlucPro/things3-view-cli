import Database from 'better-sqlite3';
import type { ProjectView, TaskView } from '../domain/models.js';
import { assertSupportedSchema } from './schema-guard.js';

type TaskRow = { id: string; title: string; notes: string | null; dueDate: number | null; projectId: string | null; projectTitle: string | null; headingId: string | null; headingTitle: string | null };

export class ThingsSqliteRepository {
  private readonly db: Database.Database;

  constructor(path: string) {
    this.db = new Database(path, { readonly: true, fileMustExist: true });
    assertSupportedSchema(this.db);
  }

  close(): void { this.db.close(); }

  listProjects(): ProjectView[] {
    return this.db.prepare(`SELECT p.uuid id, p.title title, a.uuid areaId, a.title areaTitle FROM TMTask p LEFT JOIN TMArea a ON a.uuid=p.area WHERE p.type=1 AND p.trashed=0 ORDER BY p."index", p.title COLLATE NOCASE`).all().map((row: any) => ({ id: row.id, title: row.title, ...(row.areaId ? { area: { id: row.areaId, title: row.areaTitle } } : {}) }));
  }

  listOpenTasks(projectId?: string): TaskView[] {
    const rows = this.db.prepare(`SELECT t.uuid id,t.title,t.notes,t.dueDate,p.uuid projectId,p.title projectTitle,h.uuid headingId,h.title headingTitle FROM TMTask t LEFT JOIN TMTask p ON p.uuid=t.project AND p.type=1 LEFT JOIN TMTask h ON h.uuid=t.actionGroup AND h.type=2 WHERE t.type=0 AND t.status=0 AND t.trashed=0 ${projectId ? 'AND t.project=?' : ''} ORDER BY t."index",t.title COLLATE NOCASE`).all(...(projectId ? [projectId] : [])) as TaskRow[];
    const tasks: TaskView[] = rows.map((row) => ({ id: row.id, title: row.title, ...(row.notes ? { notes: row.notes } : {}), ...(row.dueDate !== null ? { rawDueDate: row.dueDate } : {}), ...(row.projectId ? { project: { id: row.projectId, title: row.projectTitle! } } : {}), ...(row.headingId ? { heading: { id: row.headingId, title: row.headingTitle! } } : {}), tags: [], checklist: [], status: 'open' }));
    if (tasks.length === 0) return tasks;
    const marks = tasks.map(() => '?').join(',');
    const ids = tasks.map((task) => task.id);
    const byId = new Map(tasks.map((task) => [task.id, task]));
    for (const row of this.db.prepare(`SELECT uuid id,title,status,task FROM TMChecklistItem WHERE task IN (${marks}) ORDER BY task,"index"`).all(...ids) as any[]) byId.get(row.task)?.checklist.push({ id: row.id, title: row.title, completed: row.status === 3 });
    for (const row of this.db.prepare(`SELECT tt.tasks task,tag.uuid id,tag.title FROM TMTaskTag tt JOIN TMTag tag ON tag.uuid=tt.tags WHERE tt.tasks IN (${marks}) ORDER BY tag.title COLLATE NOCASE`).all(...ids) as any[]) byId.get(row.task)?.tags.push({ id: row.id, title: row.title });
    return tasks;
  }

  findOpenTaskById(id: string): TaskView | undefined {
    return this.listOpenTasks().find((task) => task.id === id);
  }

  findProjectsByExactIdOrName(query: string): ProjectView[] {
    const projects = this.listProjects();
    const exactId = projects.filter((project) => project.id === query);
    return exactId.length > 0 ? exactId : projects.filter((project) => project.title.toLocaleLowerCase() === query.toLocaleLowerCase());
  }
}
