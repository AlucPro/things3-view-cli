import { Command } from 'commander';
import { loadConfig } from '../infrastructure/config.js';
import { ThingsSqliteRepository } from '../infrastructure/things-repository.js';
import { ThingsService } from '../application/things-service.js';
import { renderProjects, renderTasks } from './render.js';

export function buildProgram(argv = process.argv): Command {
  const program = new Command().name('td').description('Safe local CLI for Things 3').version('0.1.0');
  const service = () => { const repo = new ThingsSqliteRepository(loadConfig().dbPath); return new ThingsService(repo, {} as any); };
  program.command('projects').option('--json').action((options) => { const s = service(); try { console.log(renderProjects(s.listProjects(), options)); } finally { (s as any).repository?.close?.(); } });
  program.command('list').option('--project <id-or-name>').option('--json').action((options) => { const s = service(); console.log(renderTasks(s.listOpenTasks(options.project), options)); });
  const normalized = argv.slice(2).join(' ') === '-p' ? ['node', 'td', 'projects'] : argv;
  program.parse(normalized);
  return program;
}
