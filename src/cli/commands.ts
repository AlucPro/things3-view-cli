import { Command } from 'commander';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { loadConfig } from '../infrastructure/config.js';
import { ThingsSqliteRepository } from '../infrastructure/things-repository.js';
import { ThingsUrlGateway } from '../infrastructure/things-url-gateway.js';
import { ThingsService } from '../application/things-service.js';
import { renderError, renderProjects, renderTasks } from './render.js';

const openUrl = async (url: string) => { await promisify(execFile)('open', [url]); };
const uuid = /^[A-Za-z0-9-]{6,}$/;

export function buildProgram(argv = process.argv): Command {
  const program = new Command().name('td').description('Safe local CLI for Things 3').version('0.1.0').showSuggestionAfterError();
  const create = () => { const config = loadConfig(); const repo = new ThingsSqliteRepository(config.dbPath); const writer = new ThingsUrlGateway({ open: openUrl, authToken: config.authToken }); return { config, repo, service: new ThingsService(repo, writer) }; };
  program.command('projects').option('--json').action((options) => { const { repo, service } = create(); try { console.log(renderProjects(service.listProjects(), options)); } finally { repo.close(); } });
  program.command('list').option('--project <id-or-name>').option('--json').action((options) => { const { repo, service } = create(); try { console.log(renderTasks(service.listOpenTasks(options.project), options)); } finally { repo.close(); } });
  program.command('add <title>').option('--project <id-or-name>').option('--notes <text>').option('--when <when>').option('--deadline <date>').option('--tag <tag...>').action(async (title, options) => { const { config, repo, service } = create(); try { if (config.readOnly) throw new Error('当前为只读模式。'); if (!title.trim()) throw new Error('事项标题不能为空。'); await service.add({ title: title.trim(), notes: options.notes, projectId: options.project ? service.resolveProject(options.project).id : undefined, when: options.when, deadline: options.deadline, tags: options.tag }); console.log('已交给 Things 新增事项。'); } finally { repo.close(); } });
  for (const [name, action] of [['complete', 'complete'], ['cancel', 'cancel']] as const) program.command(`${name} <task-id>`).option('--yes').action(async (id, options) => { const { config, repo, service } = create(); try { if (!uuid.test(id)) throw new Error('task-id 必须是 UUID。'); const task = service.getOpenTaskForMutation(id); if (!options.yes) throw new Error(`将${name === 'complete' ? '完成' : '取消'} “${task.title}”；请使用 --yes 确认。`); if (config.readOnly) throw new Error('当前为只读模式。'); const result = action === 'complete' ? await service.complete(id, { verify: true }) : await service.cancel(id, { verify: true }); console.log(result.state === 'verified' ? '操作已核验。' : '已交给 Things，但未能核验。'); } finally { repo.close(); } });
  const args = argv.slice(2); const normalized = args.length === 1 && args[0] === '-p' ? ['node', 'td', 'projects'] : args.length === 1 && args[0] === '-l' ? ['node', 'td', 'list'] : (args.length === 3 && args[0] === '-p' && args[2] === '-l' ? ['node', 'td', 'list', '--project', args[1]!] : argv);
  program.exitOverride();
  program.parseAsync(normalized).catch((error) => { console.error(renderError(error)); process.exitCode = 2; });
  return program;
}
