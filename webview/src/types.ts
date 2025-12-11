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
