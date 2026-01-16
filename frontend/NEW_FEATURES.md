# New Frontend Features

This document describes the new frontend features added in the major features update.

## Table of Contents
1. [Keyboard Shortcuts](#keyboard-shortcuts)
2. [Export/Import UI](#exportimport-ui)
3. [Task Dependencies UI](#task-dependencies-ui)
4. [Integration Points](#integration-points)

---

## Keyboard Shortcuts

### Overview
A comprehensive keyboard shortcuts system for power users to navigate and interact with the application faster.

### Available Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `C` | Create Task | Opens the create task modal |
| `S` | Selection Mode | Toggles task selection mode |
| `Ctrl+S` / `Cmd+S` | Save | Saves current changes |
| `/` | Search | Focus search input (future) |
| `Q` | Quick Add | Quick add task (future) |
| `Delete` | Delete | Deletes selected items |
| `Esc` | Cancel/Close | Closes modals or cancels selection |
| `Shift+?` | Help | Opens keyboard shortcuts modal |

### Usage

The keyboard shortcuts are automatically enabled on the TasksPage. To open the shortcuts modal:
- Press `Shift+?`
- Click the "Shortcuts" button in the header

### Implementation

- **Hook**: `useKeyboardShortcuts` in `src/hooks/useKeyboardShortcuts.ts`
- **Component**: `KeyboardShortcutsModal` in `src/components/keyboard-shortcuts/KeyboardShortcutsModal.tsx`
- **Integration**: `TasksPage.tsx`

---

## Export/Import UI

### Overview
User-friendly interface for exporting tasks to CSV/JSON and importing tasks from files.

### Export Features

1. **Export to CSV**
   - Click "Export" button → "Export as CSV"
   - Downloads tasks as CSV file
   - Includes: ID, Title, Description, Status, Priority, Due Date, Project ID, Created At, Updated At

2. **Export to JSON**
   - Click "Export" button → "Export as JSON"
   - Downloads tasks as JSON file
   - Full task data with all fields

### Import Features

1. **Import from CSV**
   - Click "Import" button
   - Select CSV file
   - Tasks are imported and validated
   - Shows success/error messages

2. **Import from JSON**
   - Click "Import" button
   - Select JSON file
   - Tasks are imported and validated
   - Shows success/error messages

### Implementation

- **Component**: `ExportImportButtons` in `src/components/export-import/ExportImportButtons.tsx`
- **API Client**: `src/api/exportImport.ts`
- **Integration**: `TasksPage.tsx` header

---

## Task Dependencies UI

### Overview
Visual interface for managing task dependencies (depends on, blocks, blocked by).

### Features

1. **View Dependencies**
   - See all tasks this task depends on
   - See all tasks this task blocks
   - See all tasks blocking this task (highlighted in amber)

2. **Add Dependency**
   - Click "Add" button
   - Select task from dropdown
   - Dependency is created
   - Circular dependency detection

3. **Remove Dependency**
   - Click X button next to dependency
   - Dependency is removed

### Visual Indicators

- **Depends On**: Regular list items
- **Blocks**: Regular list items
- **Blocked By**: Amber highlighted items with warning icon

### Implementation

- **Component**: `TaskDependencies` in `src/components/task-dependencies/TaskDependencies.tsx`
- **API Client**: `src/api/taskDependencies.ts`
- **Integration**: `TaskDetailsModal.tsx`

---

## Integration Points

### TasksPage

New features integrated:
- **Export/Import buttons** in header
- **Keyboard shortcuts** button in header
- **Keyboard shortcuts modal** accessible via `Shift+?`
- **Keyboard shortcuts hook** for all shortcuts

### TaskDetailsModal

New features integrated:
- **Task Dependencies section** showing all dependencies
- Automatically loads all tasks from project for dependency selection

---

## API Integration

### Task Dependencies API

```typescript
// Add dependency
addTaskDependency(taskId, { depends_on_task_id: string })

// Remove dependency
removeTaskDependency(taskId, { depends_on_task_id: string })

// Get dependencies
getTaskDependencies(taskId)
```

### Export/Import API

```typescript
// Export CSV
exportTasksCSV(projectId?: string): Promise<Blob>

// Export JSON
exportTasksJSON(projectId?: string): Promise<any>

// Import CSV
importTasksCSV(file: File): Promise<{ imported: number, errors: string[] }>

// Import JSON
importTasksJSON(tasks: any[]): Promise<{ imported: number, errors: string[] }>
```

---

## Usage Examples

### Using Keyboard Shortcuts

```typescript
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '../hooks/useKeyboardShortcuts';

function MyComponent() {
  useKeyboardShortcuts([
    {
      ...COMMON_SHORTCUTS.CREATE_TASK,
      action: () => openCreateModal(),
    },
  ], true);
}
```

### Using Export/Import

```typescript
import ExportImportButtons from '../components/export-import/ExportImportButtons';

function TasksPage() {
  return (
    <div>
      <ExportImportButtons
        projectId={activeProjectId}
        onImportComplete={() => refreshTasks()}
      />
    </div>
  );
}
```

### Using Task Dependencies

```typescript
import TaskDependencies from '../components/task-dependencies/TaskDependencies';

function TaskDetailsModal({ task, allTasks }) {
  return (
    <TaskDependencies
      taskId={task.id}
      allTasks={allTasks}
      onUpdate={() => refreshTasks()}
    />
  );
}
```

---

## Future Enhancements

- [ ] Autocomplete for @mentions in task descriptions
- [ ] Visual dependency graph
- [ ] Bulk export/import
- [ ] Custom export templates
- [ ] Keyboard shortcuts customization
- [ ] More keyboard shortcuts for navigation

---

## Notes

- Keyboard shortcuts are disabled when typing in input fields
- Export/Import requires authentication
- Task dependencies prevent circular dependencies automatically
- All new features are fully integrated with existing error handling and loading states
