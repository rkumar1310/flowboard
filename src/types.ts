export interface Task {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
}

export interface Column {
	id: string;
	title: string;
	tasks: Task[];
}

export interface Board {
	columns: Column[];
}

export type MessageToWebview =
	| { type: 'loadBoard'; board: Board }
	| { type: 'noWorkspace' }
	| { type: 'error'; message: string };

export type MessageToExtension =
	| { type: 'ready' }
	| { type: 'updateBoard'; board: Board }
	| { type: 'addTask'; columnId: string; title: string; description?: string }
	| { type: 'editTask'; taskId: string; title: string; description?: string }
	| { type: 'deleteTask'; taskId: string }
	| { type: 'moveTask'; taskId: string; toColumnId: string; toIndex: number };

export const DEFAULT_COLUMNS: Column[] = [
	{ id: 'backlog', title: 'Backlog', tasks: [] },
	{ id: 'in-progress', title: 'In Progress', tasks: [] },
	{ id: 'done', title: 'Done', tasks: [] },
];
