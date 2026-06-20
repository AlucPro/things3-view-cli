import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { assertSupportedSchema } from '../src/infrastructure/schema-guard.js';
import { createFixtureDb } from './helpers/create-fixture-db.js';

describe('assertSupportedSchema', () => {
  it('rejects a database missing TMChecklistItem', () => {
    const db = new Database(':memory:');
    db.exec('CREATE TABLE TMTask (uuid TEXT PRIMARY KEY, type INTEGER, status INTEGER, trashed INTEGER, title TEXT)');
    db.exec('CREATE TABLE TMArea (uuid TEXT PRIMARY KEY, title TEXT)');
    db.exec('CREATE TABLE TMTag (uuid TEXT PRIMARY KEY, title TEXT)');
    db.exec('CREATE TABLE TMTaskTag (tasks TEXT, tags TEXT)');
    db.exec('CREATE TABLE TMAreaTag (areas TEXT, tags TEXT)');

    expect(() => assertSupportedSchema(db)).toThrow(/TMChecklistItem/);
  });

  it('accepts the supported fixture schema', () => {
    const fixture = createFixtureDb();
    const db = new Database(fixture.path, { readonly: true });
    expect(() => assertSupportedSchema(db)).not.toThrow();
    db.close();
  });
});
