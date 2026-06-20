export type ProjectView = { id: string; title: string; area?: { id: string; title: string } };
export type ChecklistItemView = { id: string; title: string; completed: boolean };
export type TagView = { id: string; title: string };
export type TaskView = {
  id: string;
  title: string;
  notes?: string;
  project?: ProjectView;
  heading?: { id: string; title: string };
  tags: TagView[];
  checklist: ChecklistItemView[];
  status: 'open';
  rawDueDate?: number;
};
