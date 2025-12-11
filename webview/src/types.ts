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

declare global {
	interface Window {
		acquireVsCodeApi: () => {
			postMessage: (message: MessageToExtension) => void;
			getState: () => unknown;
			setState: (state: unknown) => void;
		};
	}
}

export const vscode = window.acquireVsCodeApi();
