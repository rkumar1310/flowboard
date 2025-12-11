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

export interface Note {
	id: string;
	title: string;
	content?: string;
}

export interface TodoItem {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
}

export interface FlowboardData {
	board: Board;
	notes: Note[];
	todos: TodoItem[];
}

export type MessageToWebview =
	| { type: 'loadData'; data: FlowboardData }
	| { type: 'noWorkspace' }
	| { type: 'error'; message: string };

export type MessageToExtension =
	| { type: 'ready' }
	| { type: 'updateData'; data: FlowboardData };

export const DEFAULT_COLUMNS: Column[] = [
	{ id: 'backlog', title: 'Backlog', tasks: [] },
	{ id: 'in-progress', title: 'In Progress', tasks: [] },
	{ id: 'done', title: 'Done', tasks: [] },
];

export const DEFAULT_DATA: FlowboardData = {
	board: { columns: DEFAULT_COLUMNS },
	notes: [],
	todos: [],
};
