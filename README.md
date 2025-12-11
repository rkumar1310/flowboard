# Flowboard

A VS Code extension that provides a per-project Kanban board, notes, and todo list for managing tasks. Everything opens in the main editor area and is persisted to `.vscode/FLOWBOARD.md` — plain markdown, version-controllable, and perfect for team collaboration.

## Features

- **Three Tabs** - Board, Notes, and Todo in one place
- **Kanban Board** - Three columns: Backlog, In Progress, Done
- **Notes** - Card-style notes with search functionality
- **Todo List** - Simple checklist with completion tracking
- **Drag & Drop** - Reorder items with smooth drag and drop
- **Markdown Persistence** - Everything saved to `.vscode/FLOWBOARD.md`
- **Version Control Friendly** - Plain text format works great with git
- **Theme Support** - Automatically adapts to your VS Code theme (dark, light, high-contrast)

## Usage

1. Click the Flowboard icon in the Activity Bar (left sidebar)
2. Click "Open Board" to open Flowboard
3. Use the tabs to switch between Board, Notes, and Todo
4. Add items using the "+ Add" buttons
5. Drag to reorder items
6. Edit or delete items using the icons that appear on hover

## File Format

All data is stored in `.vscode/FLOWBOARD.md`:

```markdown
# Board

## Backlog
- [ ] Task one
- [ ] Task two - with description

## In Progress
- [ ] Working on this

## Done
- [x] Finished task

# Notes
- Note title - Note content here
- Another note - More details

# Todo
- [ ] Todo item - optional description
- [x] Completed todo
```

## Release Notes

### 0.0.3

- Added tabs: Board, Notes, Todo
- Notes with search and drag-to-reorder
- Todo list with completion tracking
- All data in single FLOWBOARD.md file

### 0.0.2

- Moved FLOWBOARD.md to `.vscode/` folder for team sharing

### 0.0.1

Initial release of Flowboard.
