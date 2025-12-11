import * as vscode from 'vscode';
import { Board, Column, Task, Note, TodoItem, FlowboardData, DEFAULT_COLUMNS } from './types';

const FLOWBOARD_PATH = '.vscode/FLOWBOARD.md';

export async function getFlowboardUri(): Promise<vscode.Uri | undefined> {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		return undefined;
	}
	return vscode.Uri.joinPath(workspaceFolders[0].uri, FLOWBOARD_PATH);
}

async function ensureVscodeFolder(): Promise<void> {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		return;
	}
	const vscodeUri = vscode.Uri.joinPath(workspaceFolders[0].uri, '.vscode');
	try {
		await vscode.workspace.fs.stat(vscodeUri);
	} catch {
		await vscode.workspace.fs.createDirectory(vscodeUri);
	}
}

export async function readData(): Promise<FlowboardData> {
	const uri = await getFlowboardUri();
	if (!uri) {
		return getDefaultData();
	}

	try {
		const content = await vscode.workspace.fs.readFile(uri);
		const text = new TextDecoder().decode(content);
		return parseMarkdown(text);
	} catch {
		return getDefaultData();
	}
}

export async function writeData(data: FlowboardData): Promise<void> {
	const uri = await getFlowboardUri();
	if (!uri) {
		vscode.window.showErrorMessage('No workspace folder open');
		return;
	}

	await ensureVscodeFolder();
	const markdown = dataToMarkdown(data);
	const content = new TextEncoder().encode(markdown);
	await vscode.workspace.fs.writeFile(uri, content);
}

function getDefaultData(): FlowboardData {
	return {
		board: { columns: structuredClone(DEFAULT_COLUMNS) },
		notes: [],
		todos: [],
	};
}

function generateId(): string {
	return Math.random().toString(36).substring(2, 11);
}

type SectionType = 'board' | 'notes' | 'todo' | null;

function parseMarkdown(text: string): FlowboardData {
	const lines = text.split('\n');
	const columns: Column[] = [];
	const notes: Note[] = [];
	const todos: TodoItem[] = [];

	let currentSection: SectionType = null;
	let currentColumn: Column | null = null;
	let hasTopLevelHeaders = false;

	for (const line of lines) {
		const trimmed = line.trim();

		// Check for top-level section headers (# Board, # Notes, # Todo)
		const sectionMatch = trimmed.match(/^#\s+(Board|Notes|Todo)$/i);
		if (sectionMatch) {
			hasTopLevelHeaders = true;
			const sectionName = sectionMatch[1].toLowerCase();
			if (sectionName === 'board') {
				currentSection = 'board';
			} else if (sectionName === 'notes') {
				currentSection = 'notes';
			} else if (sectionName === 'todo') {
				currentSection = 'todo';
			}
			currentColumn = null;
			continue;
		}

		// Check for column header (## Header) - only valid in board section
		const headerMatch = trimmed.match(/^##\s+(.+)$/);
		if (headerMatch) {
			// If no top-level headers found yet, assume we're in board section (backward compat)
			if (!hasTopLevelHeaders) {
				currentSection = 'board';
			}

			if (currentSection === 'board') {
				const title = headerMatch[1].trim();
				const id = titleToId(title);
				currentColumn = { id, title, tasks: [] };
				columns.push(currentColumn);
			}
			continue;
		}

		// Parse list items based on current section
		if (currentSection === 'board' && currentColumn) {
			// Board task: - [ ] or - [x]
			const taskMatch = trimmed.match(/^-\s+\[([ xX])\]\s+(.+)$/);
			if (taskMatch) {
				const completed = taskMatch[1].toLowerCase() === 'x';
				const taskText = taskMatch[2].trim();
				const { title, description } = parseTitleDescription(taskText);

				const task: Task = {
					id: generateId(),
					title,
					description,
					completed,
				};
				currentColumn.tasks.push(task);
			}
		} else if (currentSection === 'notes') {
			// Note: - Title - Content
			const noteMatch = trimmed.match(/^-\s+(.+)$/);
			if (noteMatch) {
				const noteText = noteMatch[1].trim();
				const { title, description: content } = parseTitleDescription(noteText);

				const note: Note = {
					id: generateId(),
					title,
					content,
				};
				notes.push(note);
			}
		} else if (currentSection === 'todo') {
			// Todo: - [ ] or - [x]
			const todoMatch = trimmed.match(/^-\s+\[([ xX])\]\s+(.+)$/);
			if (todoMatch) {
				const completed = todoMatch[1].toLowerCase() === 'x';
				const todoText = todoMatch[2].trim();
				const { title, description } = parseTitleDescription(todoText);

				const todo: TodoItem = {
					id: generateId(),
					title,
					description,
					completed,
				};
				todos.push(todo);
			}
		} else if (!hasTopLevelHeaders && currentColumn === null) {
			// Backward compatibility: if no section headers and no column yet,
			// check for task items (old format without # Board header)
			const taskMatch = trimmed.match(/^-\s+\[([ xX])\]\s+(.+)$/);
			if (taskMatch && columns.length > 0) {
				const lastColumn = columns[columns.length - 1];
				const completed = taskMatch[1].toLowerCase() === 'x';
				const taskText = taskMatch[2].trim();
				const { title, description } = parseTitleDescription(taskText);

				const task: Task = {
					id: generateId(),
					title,
					description,
					completed,
				};
				lastColumn.tasks.push(task);
			}
		}
	}

	// If no columns found, return default structure
	if (columns.length === 0) {
		return {
			board: { columns: structuredClone(DEFAULT_COLUMNS) },
			notes,
			todos,
		};
	}

	return {
		board: { columns },
		notes,
		todos,
	};
}

function parseTitleDescription(text: string): { title: string; description?: string } {
	const separatorIndex = text.indexOf(' - ');
	if (separatorIndex > 0) {
		return {
			title: text.substring(0, separatorIndex),
			description: text.substring(separatorIndex + 3),
		};
	}
	return { title: text };
}

function titleToId(title: string): string {
	return title.toLowerCase().replace(/\s+/g, '-');
}

function dataToMarkdown(data: FlowboardData): string {
	const lines: string[] = [];

	// Board section
	lines.push('# Board');
	lines.push('');

	for (const column of data.board.columns) {
		lines.push(`## ${column.title}`);

		for (const task of column.tasks) {
			const checkbox = task.completed ? '[x]' : '[ ]';
			let taskLine = `- ${checkbox} ${task.title}`;
			if (task.description) {
				taskLine += ` - ${task.description}`;
			}
			lines.push(taskLine);
		}

		lines.push('');
	}

	// Notes section
	lines.push('# Notes');
	for (const note of data.notes) {
		let noteLine = `- ${note.title}`;
		if (note.content) {
			noteLine += ` - ${note.content}`;
		}
		lines.push(noteLine);
	}
	lines.push('');

	// Todo section
	lines.push('# Todo');
	for (const todo of data.todos) {
		const checkbox = todo.completed ? '[x]' : '[ ]';
		let todoLine = `- ${checkbox} ${todo.title}`;
		if (todo.description) {
			todoLine += ` - ${todo.description}`;
		}
		lines.push(todoLine);
	}
	lines.push('');

	return lines.join('\n');
}

// Keep old function names for backward compatibility during migration
export const readBoard = readData;
export const writeBoard = writeData;
