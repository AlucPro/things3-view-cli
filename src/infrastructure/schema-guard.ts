import type Database from 'better-sqlite3';

export class SchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaError';
  }
}

const requiredColumns: Record<string, string[]> = {
  TMTask: ['uuid', 'type', 'status', 'trashed', 'title', 'notes', 'dueDate', 'start', 'index', 'todayIndex', 'area', 'project', 'actionGroup'],
  TMArea: ['uuid', 'title'],
  TMChecklistItem: ['uuid', 'title', 'status', 'task', 'index'],
  TMTag: ['uuid', 'title'],
  TMTaskTag: ['tasks', 'tags'],
  TMAreaTag: ['areas', 'tags'],
};

export function assertSupportedSchema(db: Database.Database): void {
  for (const table of Object.keys(requiredColumns)) {
    const exists = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(table);
    if (!exists) throw new SchemaError(`Things 数据库版本不受支持：缺少表 ${table}`);
  }

  for (const [table, columns] of Object.entries(requiredColumns)) {
    const actual = new Set((db.prepare(`PRAGMA table_info('${table}')`).all() as Array<{ name: string }>).map((column) => column.name));
    for (const column of columns) {
      if (!actual.has(column)) {
        throw new SchemaError(`Things 数据库版本不受支持：${table} 缺少列 ${column}`);
      }
    }
  }
}
