import * as vscode from 'vscode';
import { Board, Column, Task, DEFAULT_COLUMNS } from './types';

const FLOWBOARD_FILENAME = 'FLOWBOARD.md';

export async function getFlowboardUri(): Promise<vscode.Uri | undefined> {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		return undefined;
	}
	return vscode.Uri.joinPath(workspaceFolders[0].uri, FLOWBOARD_FILENAME);
}

export async function readBoard(): Promise<Board> {
	const uri = await getFlowboardUri();
	if (!uri) {
		return { columns: structuredClone(DEFAULT_COLUMNS) };
	}

	try {
		const content = await vscode.workspace.fs.readFile(uri);
		const text = new TextDecoder().decode(content);
		return parseMarkdown(text);
	} catch {
		// File doesn't exist yet, return default board
		return { columns: structuredClone(DEFAULT_COLUMNS) };
	}
}

export async function writeBoard(board: Board): Promise<void> {
	const uri = await getFlowboardUri();
	if (!uri) {
		vscode.window.showErrorMessage('No workspace folder open');
		return;
	}

	const markdown = boardToMarkdown(board);
	const content = new TextEncoder().encode(markdown);
	await vscode.workspace.fs.writeFile(uri, content);
}

function generateId(): string {
	return Math.random().toString(36).substring(2, 11);
}

function parseMarkdown(text: string): Board {
	const lines = text.split('\n');
	const columns: Column[] = [];
	let currentColumn: Column | null = null;

	for (const line of lines) {
		const trimmed = line.trim();

		// Check for column header (## Header)
		const headerMatch = trimmed.match(/^##\s+(.+)$/);
		if (headerMatch) {
			const title = headerMatch[1].trim();
			const id = titleToId(title);
			currentColumn = { id, title, tasks: [] };
			columns.push(currentColumn);
			continue;
		}

		// Check for task (- [ ] or - [x])
		if (currentColumn) {
			const taskMatch = trimmed.match(/^-\s+\[([ xX])\]\s+(.+)$/);
			if (taskMatch) {
				const completed = taskMatch[1].toLowerCase() === 'x';
				const taskText = taskMatch[2].trim();

				// Parse title and optional description (separated by " - ")
				const separatorIndex = taskText.indexOf(' - ');
				let title: string;
				let description: string | undefined;

				if (separatorIndex > 0) {
					title = taskText.substring(0, separatorIndex);
					description = taskText.substring(separatorIndex + 3);
				} else {
					title = taskText;
				}

				const task: Task = {
					id: generateId(),
					title,
					description,
					completed,
				};
				currentColumn.tasks.push(task);
			}
		}
	}

	// If no columns found, return default structure
	if (columns.length === 0) {
		return { columns: structuredClone(DEFAULT_COLUMNS) };
	}

	return { columns };
}

function titleToId(title: string): string {
	return title.toLowerCase().replace(/\s+/g, '-');
}

function boardToMarkdown(board: Board): string {
	const lines: string[] = [];

	for (const column of board.columns) {
		lines.push(`## ${column.title}`);

		for (const task of column.tasks) {
			const checkbox = task.completed ? '[x]' : '[ ]';
			let taskLine = `- ${checkbox} ${task.title}`;
			if (task.description) {
				taskLine += ` - ${task.description}`;
			}
			lines.push(taskLine);
		}

		lines.push(''); // Empty line between columns
	}

	return lines.join('\n');
}
