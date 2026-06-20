import Database from 'better-sqlite3';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function createFixtureDb(): { path: string; projectId: string; taskId: string } {
  const path = join(mkdtempSync(join(tmpdir(), 'td-fixture-')), 'things.sqlite');
  const db = new Database(path);
  db.exec(`
    CREATE TABLE TMTask (uuid TEXT PRIMARY KEY, type INTEGER, status INTEGER, trashed INTEGER, title TEXT, notes TEXT, dueDate REAL, start INTEGER, "index" INTEGER, todayIndex INTEGER, area TEXT, project TEXT, actionGroup TEXT);
    CREATE TABLE TMArea (uuid TEXT PRIMARY KEY, title TEXT);
    CREATE TABLE TMChecklistItem (uuid TEXT PRIMARY KEY, title TEXT, status INTEGER, task TEXT, "index" INTEGER);
    CREATE TABLE TMTag (uuid TEXT PRIMARY KEY, title TEXT);
    CREATE TABLE TMTaskTag (tasks TEXT, tags TEXT);
    CREATE TABLE TMAreaTag (areas TEXT, tags TEXT);
  `);
  const ids = { area: 'area-1', project: 'project-1', task: 'task-1', heading: 'heading-1', done: 'task-done' };
  db.prepare('INSERT INTO TMArea VALUES (?, ?)').run(ids.area, 'Personal');
  db.prepare('INSERT INTO TMTask VALUES (?, 1, 0, 0, ?, NULL, NULL, 0, 0, 0, ?, NULL, NULL)').run(ids.project, 'Home', ids.area);
  db.prepare('INSERT INTO TMTask VALUES (?, 2, 0, 0, ?, NULL, NULL, 0, 0, 0, NULL, ?, NULL)').run(ids.heading, 'Errands', ids.project);
  db.prepare('INSERT INTO TMTask VALUES (?, 0, 0, 0, ?, ?, NULL, 0, 0, 0, NULL, ?, ?)').run(ids.task, 'Buy milk', 'Two litres', ids.project, ids.heading);
  db.prepare('INSERT INTO TMTask VALUES (?, 0, 3, 0, ?, NULL, NULL, 0, 1, 0, NULL, ?, NULL)').run(ids.done, 'Already done', ids.project);
  db.prepare('INSERT INTO TMChecklistItem VALUES (?, ?, 0, ?, 0)').run('check-1', 'Check fridge', ids.task);
  db.prepare('INSERT INTO TMTag VALUES (?, ?)').run('tag-1', 'Errands');
  db.prepare('INSERT INTO TMTaskTag VALUES (?, ?)').run(ids.task, 'tag-1');
  db.close();
  return { path, projectId: ids.project, taskId: ids.task };
}
