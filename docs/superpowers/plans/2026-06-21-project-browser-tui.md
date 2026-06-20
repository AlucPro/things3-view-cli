# Project Browser TUI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `td` TUI 显示可选择的项目列表，并以带 Unicode 边框的卡片展示所选项目的未完成事项。

**Architecture:** `App` 保持项目、事项、焦点和确认态；通过现有 `ThingsService` 获取 `ProjectView` 与按项目 UUID 过滤的 `TaskView`。新增纯渲染 helpers，避免 UI 状态逻辑与卡片字符串生成耦合。

**Tech Stack:** TypeScript、React、Ink、ink-testing-library、Vitest。

---

### Task 1: Project selection state and keyboard navigation

**Files:**
- Modify: `src/tui/App.tsx`
- Modify: `tests/tui.test.tsx`

- [ ] **Step 1: Write failing tests for project selection and focus.**

```tsx
it('loads tasks for the selected project and switches projects with down arrow', async () => {
  const service = makeService({ projects: [home, work], tasks: { home: [milk], work: [report] } });
  const ui = render(<App service={service} />);
  expect(ui.lastFrame()).toContain('Buy milk');
  ui.stdin.write('\u001b[B');
  await tick();
  expect(ui.lastFrame()).toContain('Write report');
  expect(service.listOpenTasks).toHaveBeenLastCalledWith('work');
});
```

- [ ] **Step 2: Run the test and confirm it fails because the current App ignores projects.**

Run: `npm test -- tests/tui.test.tsx`

Expected: FAIL; the selected project and filtered task list do not exist.

- [ ] **Step 3: Implement project/task focus state.**

Create `projects`, `selectedProjectIndex`, `tasks`, `selectedTaskIndex`, and `focus` state. Load `service.listProjects()` once, then `service.listOpenTasks(project.id)` whenever the selected project changes. Implement `↑/↓`, `Tab`, `r`, and preserve the project UUID during refresh when it still exists.

- [ ] **Step 4: Run focused and full tests.**

Run: `npm test -- tests/tui.test.tsx && npm test`

Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/tui/App.tsx tests/tui.test.tsx
git commit -m "feat: browse Things projects in terminal UI"
```

### Task 2: Box-mode task cards and guarded actions

**Files:**
- Create: `src/tui/task-card.ts`
- Modify: `src/tui/App.tsx`
- Modify: `tests/tui.test.tsx`

- [ ] **Step 1: Write failing tests for card border and task-focus confirmation.**

```ts
expect(renderTaskCard(milk, { selected: true, width: 40 })).toContain('┌');
expect(renderTaskCard(milk, { selected: true, width: 40 })).toContain('│ Buy milk');
expect(renderTaskCard(milk, { selected: true, width: 40 })).toContain('└');
```

Write a TUI test that verifies `c` does nothing while the project pane owns focus, then opens `Complete Buy milk?` after `Tab` transfers focus to the task pane.

- [ ] **Step 2: Run the tests and confirm they fail because no box renderer or focus guard exists.**

Run: `npm test -- tests/tui.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement `renderTaskCard`.**

`renderTaskCard(task, { selected, width })` returns title, metadata, and optional notes summary inside `┌─┐│└─┘`; truncate visible text to fit `width`. Use cyan only for the selected task card. In `App`, call `complete`/`cancel` only when `focus === 'tasks'`.

- [ ] **Step 4: Run complete verification.**

Run: `npm test && npm run check && npm run build`

Expected: 0 test failures and successful type check/build.

- [ ] **Step 5: Commit.**

```bash
git add src/tui/task-card.ts src/tui/App.tsx tests/tui.test.tsx
git commit -m "feat: render Things tasks as bordered cards"
```
