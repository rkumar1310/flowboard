# Flowboard

## Project Objective

A VS Code extension that provides a per-project Kanban board for managing tasks. The board lives in the sidebar (Activity Bar icon), not a floating panel. All tasks are persisted to a `FLOWBOARD.md` file in the workspace root — plain markdown, version-controllable, human-readable.

## Design

### UI Location
- Activity Bar icon (left sidebar strip) — custom SVG icon
- Clicking the icon opens the Kanban board in the sidebar view
- Board is always accessible, per-workspace

### Board Structure
- Columns: `Backlog`, `In Progress`, `Done` (configurable later)
- Cards: draggable tasks with title and optional description
- Drag and drop between columns
- Add / edit / delete tasks

### File Backend (`FLOWBOARD.md`)
- Stored in workspace root
- Format:
```
## Backlog
- [ ] Task one
- [ ] Task two with description

## In Progress  
- [ ] Working on this

## Done
- [x] Finished task
```
- File is read on extension activation
- File is written on every board change (debounced)

### Theming
- Inherits VS Code theme automatically via CSS variables
- Works in dark, light, and high-contrast modes out of the box

## Libraries

### Extension
- `@types/vscode` — VS Code API types
- `esbuild` — bundler (already scaffolded by yo code)

### Webview UI
- `@vscode-elements/elements` — native-looking VS Code UI components (buttons, inputs, etc.)
- `@vscode-elements/react-elements` — React wrappers for the above
- `react` + `react-dom` — UI framework
- `vite` — webview bundler with fast builds

### Drag and Drop
- `@dnd-kit/core` + `@dnd-kit/sortable` — lightweight, accessible drag-and-drop for React

## Install Commands
```bash
# Webview UI
npm install @vscode-elements/elements @vscode-elements/react-elements
npm install react react-dom
npm install @dnd-kit/core @dnd-kit/sortable

# Dev dependencies
npm install -D vite @vitejs/plugin-react @types/react @types/react-dom
```