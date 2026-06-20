import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { ProjectView, TaskView } from '../domain/models.js';

type Service = { listProjects(): ProjectView[]; listOpenTasks(projectId?: string): TaskView[]; complete(id: string, options?: unknown): Promise<unknown>; cancel?(id: string, options?: unknown): Promise<unknown> };
const card = (task: TaskView, selected: boolean) => {
  const meta = [task.heading?.title, task.tags.map((tag) => `#${tag.title}`).join(' '), task.checklist.length ? `${task.checklist.filter((item) => item.completed).length}/${task.checklist.length}` : ''].filter(Boolean).join(' · ');
  return <Box flexDirection="column" borderStyle="single" borderColor={selected ? 'cyan' : undefined} paddingX={1}><Text color={selected ? 'cyan' : undefined}>{task.title}</Text>{meta ? <Text dimColor>{meta}</Text> : null}{task.notes ? <Text dimColor>{task.notes.split('\n')[0]}</Text> : null}</Box>;
};

export function App({ service }: { service: Service }) {
  const [projects, setProjects] = useState(() => service.listProjects());
  const [projectIndex, setProjectIndex] = useState(0);
  const project = projects[projectIndex];
  const [tasks, setTasks] = useState(() => project ? service.listOpenTasks(project.id) : []);
  const [taskIndex, setTaskIndex] = useState(0);
  const [focus, setFocus] = useState<'projects' | 'tasks'>('projects');
  const [pending, setPending] = useState<'complete' | 'cancel'>();
  const task = tasks[taskIndex];
  const selectProject = (index: number) => { const next = projects[index]; if (!next) return; setProjectIndex(index); setTasks(service.listOpenTasks(next.id)); setTaskIndex(0); };
  useInput(async (input, key) => {
    if (pending) { if (input === 'y' && task) { await (pending === 'complete' ? service.complete(task.id, { verify: true }) : service.cancel?.(task.id, { verify: true })); if (project) setTasks(service.listOpenTasks(project.id)); } if (input === 'y' || input === 'n' || key.escape) setPending(undefined); return; }
    if (key.tab) { setFocus((value) => value === 'projects' ? 'tasks' : 'projects'); return; }
    if (input === 'r') { const next = service.listProjects(); const index = Math.max(0, next.findIndex((item) => item.id === project?.id)); setProjects(next); const current = next[index]; setProjectIndex(index); setTasks(current ? service.listOpenTasks(current.id) : []); setTaskIndex(0); return; }
    if (focus === 'projects') { if (key.downArrow) selectProject(Math.min(projectIndex + 1, projects.length - 1)); if (key.upArrow) selectProject(Math.max(projectIndex - 1, 0)); return; }
    if (key.downArrow) setTaskIndex((value) => Math.min(value + 1, Math.max(tasks.length - 1, 0))); if (key.upArrow) setTaskIndex((value) => Math.max(value - 1, 0)); if (input === 'c' && task) setPending('complete'); if (input === 'x' && task) setPending('cancel');
  });
  if (pending && task) return <Text>{pending === 'complete' ? 'Complete' : 'Cancel'} {task.title}? (y/n)</Text>;
  return <Box flexDirection="column"><Box><Box width="33%" flexDirection="column" borderStyle="single" borderColor={focus === 'projects' ? 'cyan' : undefined}><Text bold>Projects</Text>{projects.length ? projects.map((item, index) => <Text key={item.id} color={index === projectIndex ? 'cyan' : undefined}>{index === projectIndex ? '›' : ' '} {item.title}</Text>) : <Text>没有项目。</Text>}</Box><Box flexGrow={1} flexDirection="column" borderStyle="single" borderColor={focus === 'tasks' ? 'cyan' : undefined}><Text bold>{project ? `${project.title} 的事项` : '项目事项'}</Text>{tasks.length ? tasks.map((item, index) => <React.Fragment key={item.id}>{card(item, focus === 'tasks' && index === taskIndex)}</React.Fragment>) : <Text>该项目没有未完成事项。</Text>}</Box></Box><Text dimColor>↑↓ select · Tab focus · c complete · x cancel · r refresh · q quit</Text></Box>;
}
