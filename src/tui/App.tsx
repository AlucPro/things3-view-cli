import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { TaskView } from '../domain/models.js';

type Service = { listProjects(): unknown[]; listOpenTasks(): TaskView[]; complete(id: string, options?: unknown): Promise<unknown>; cancel?(id: string, options?: unknown): Promise<unknown> };

export function App({ service }: { service: Service }) {
  const [tasks, setTasks] = useState(() => service.listOpenTasks());
  const [selected, setSelected] = useState(0);
  const [pending, setPending] = useState<'complete' | 'cancel' | undefined>();
  const task = tasks[selected];
  useInput(async (input, key) => {
    if (pending) {
      if (input === 'y' && task) { await (pending === 'complete' ? service.complete(task.id, { verify: true }) : service.cancel?.(task.id, { verify: true })); setTasks(service.listOpenTasks()); }
      if (input === 'y' || input === 'n' || key.escape) setPending(undefined);
      return;
    }
    if (key.downArrow) setSelected((value) => Math.min(value + 1, Math.max(tasks.length - 1, 0)));
    if (key.upArrow) setSelected((value) => Math.max(value - 1, 0));
    if (input === 'c' && task) setPending('complete');
    if (input === 'x' && task) setPending('cancel');
    if (input === 'r') setTasks(service.listOpenTasks());
  });
  if (pending && task) return <Text>{pending === 'complete' ? 'Complete' : 'Cancel'} {task.title}? (y/n)</Text>;
  return <Box flexDirection="column"><Text bold>Things 3 — Open tasks</Text>{tasks.length === 0 ? <Text>没有未完成事项。</Text> : tasks.map((item, index) => <Text key={item.id} color={index === selected ? 'cyan' : undefined}>{index === selected ? '›' : ' '} {item.title}</Text>)}<Text dimColor>↑↓ select · c complete · x cancel · r refresh · q quit</Text></Box>;
}
