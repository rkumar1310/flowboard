# Flowboard

A VS Code extension that provides a per-project Kanban board for managing tasks. The board opens in the main editor area and all tasks are persisted to `.vscode/FLOWBOARD.md` — plain markdown, version-controllable, and perfect for team collaboration.

## Features

- **Kanban Board** - Three columns: Backlog, In Progress, Done
- **Drag & Drop** - Move tasks between columns with smooth drag and drop
- **Markdown Persistence** - Tasks saved to `.vscode/FLOWBOARD.md`
- **Version Control Friendly** - Plain text format works great with git
- **Theme Support** - Automatically adapts to your VS Code theme (dark, light, high-contrast)

## Usage

1. Click the Flowboard icon in the Activity Bar (left sidebar)
2. Click "Open Board" to open the Kanban board
3. Add tasks using the "+ Add task" button in any column
4. Drag tasks between columns to update their status
5. Edit or delete tasks using the icons that appear on hover

## File Format

Tasks are stored in `.vscode/FLOWBOARD.md`:

```markdown
## Backlog
- [ ] Task one
- [ ] Task two - with description

## In Progress
- [ ] Working on this

## Done
- [x] Finished task
```

## Release Notes

### 0.0.1

Initial release of Flowboard.
