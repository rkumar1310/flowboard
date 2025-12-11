import { useState, useEffect } from 'react';
import {
	DndContext,
	DragOverlay,
	closestCorners,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragStartEvent,
	DragEndEvent,
	DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { Board, Task, MessageToWebview, vscode } from './types';
import { KanbanColumn } from './components/KanbanColumn';
import { TaskCard } from './components/TaskCard';

type AppState = 'loading' | 'noWorkspace' | 'ready';

export default function App() {
	const [board, setBoard] = useState<Board | null>(null);
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const [appState, setAppState] = useState<AppState>('loading');

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	useEffect(() => {
		const handleMessage = (event: MessageEvent<MessageToWebview>) => {
			const message = event.data;
			switch (message.type) {
				case 'loadBoard':
					setBoard(message.board);
					setAppState('ready');
					break;
				case 'noWorkspace':
					setAppState('noWorkspace');
					break;
				case 'error':
					console.error(message.message);
					break;
			}
		};

		window.addEventListener('message', handleMessage);
		vscode.postMessage({ type: 'ready' });

		return () => window.removeEventListener('message', handleMessage);
	}, []);

	const findTask = (taskId: string): { task: Task; columnId: string } | null => {
		if (!board) return null;
		for (const column of board.columns) {
			const task = column.tasks.find((t) => t.id === taskId);
			if (task) return { task, columnId: column.id };
		}
		return null;
	};

	const findColumnByTaskId = (taskId: string): string | null => {
		const result = findTask(taskId);
		return result ? result.columnId : null;
	};

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const result = findTask(active.id as string);
		if (result) {
			setActiveTask(result.task);
		}
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over || !board) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		const activeColumnId = findColumnByTaskId(activeId);
		let overColumnId = findColumnByTaskId(overId);

		// If over is a column (not a task), use that column
		if (!overColumnId) {
			const column = board.columns.find((c) => c.id === overId);
			if (column) {
				overColumnId = column.id;
			}
		}

		if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
			return;
		}

		setBoard((prev) => {
			if (!prev) return prev;

			const activeColumn = prev.columns.find((c) => c.id === activeColumnId);
			const overColumn = prev.columns.find((c) => c.id === overColumnId);

			if (!activeColumn || !overColumn) return prev;

			const activeTaskIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
			const activeTaskItem = activeColumn.tasks[activeTaskIndex];

			const newColumns = prev.columns.map((column) => {
				if (column.id === activeColumnId) {
					return {
						...column,
						tasks: column.tasks.filter((t) => t.id !== activeId),
					};
				}
				if (column.id === overColumnId) {
					const overTaskIndex = column.tasks.findIndex((t) => t.id === overId);
					const insertIndex = overTaskIndex >= 0 ? overTaskIndex : column.tasks.length;
					const newTasks = [...column.tasks];
					newTasks.splice(insertIndex, 0, activeTaskItem);
					return {
						...column,
						tasks: newTasks,
					};
				}
				return column;
			});

			return { columns: newColumns };
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveTask(null);

		if (!over || !board) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		const activeColumnId = findColumnByTaskId(activeId);
		let overColumnId = findColumnByTaskId(overId);

		// If over is a column (empty column drop)
		if (!overColumnId) {
			const column = board.columns.find((c) => c.id === overId);
			if (column) {
				overColumnId = column.id;
			}
		}

		if (!activeColumnId || !overColumnId) return;

		if (activeColumnId === overColumnId) {
			// Reorder within the same column
			const column = board.columns.find((c) => c.id === activeColumnId);
			if (!column) return;

			const oldIndex = column.tasks.findIndex((t) => t.id === activeId);
			const newIndex = column.tasks.findIndex((t) => t.id === overId);

			if (oldIndex !== newIndex && newIndex >= 0) {
				setBoard((prev) => {
					if (!prev) return prev;
					const newColumns = prev.columns.map((col) => {
						if (col.id === activeColumnId) {
							return {
								...col,
								tasks: arrayMove(col.tasks, oldIndex, newIndex),
							};
						}
						return col;
					});
					return { columns: newColumns };
				});
			}
		}

		// Save board after drag
		setTimeout(() => {
			setBoard((current) => {
				if (current) {
					vscode.postMessage({ type: 'updateBoard', board: current });
				}
				return current;
			});
		}, 0);
	};

	const handleAddTask = (columnId: string, title: string, description?: string) => {
		if (!board) return;

		const newTask: Task = {
			id: Math.random().toString(36).substring(2, 11),
			title,
			description,
			completed: columnId === 'done',
		};

		const newBoard = {
			columns: board.columns.map((col) => {
				if (col.id === columnId) {
					return { ...col, tasks: [...col.tasks, newTask] };
				}
				return col;
			}),
		};

		setBoard(newBoard);
		vscode.postMessage({ type: 'updateBoard', board: newBoard });
	};

	const handleEditTask = (taskId: string, title: string, description?: string) => {
		if (!board) return;

		const newBoard = {
			columns: board.columns.map((col) => ({
				...col,
				tasks: col.tasks.map((task) =>
					task.id === taskId ? { ...task, title, description } : task
				),
			})),
		};

		setBoard(newBoard);
		vscode.postMessage({ type: 'updateBoard', board: newBoard });
	};

	const handleDeleteTask = (taskId: string) => {
		if (!board) return;

		const newBoard = {
			columns: board.columns.map((col) => ({
				...col,
				tasks: col.tasks.filter((task) => task.id !== taskId),
			})),
		};

		setBoard(newBoard);
		vscode.postMessage({ type: 'updateBoard', board: newBoard });
	};

	if (appState === 'loading') {
		return <div className="board">Loading...</div>;
	}

	if (appState === 'noWorkspace') {
		return (
			<div className="no-workspace">
				<div className="no-workspace-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
						<path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
					</svg>
				</div>
				<h2>No Folder Open</h2>
				<p>Open a folder to start using Flowboard</p>
			</div>
		);
	}

	if (!board) {
		return <div className="board">Loading...</div>;
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<div className="board">
				{board.columns.map((column) => (
					<KanbanColumn
						key={column.id}
						column={column}
						onAddTask={handleAddTask}
						onEditTask={handleEditTask}
						onDeleteTask={handleDeleteTask}
					/>
				))}
			</div>
			<DragOverlay>
				{activeTask ? (
					<div className="drag-overlay">
						<TaskCard
							task={activeTask}
							onEdit={() => {}}
							onDelete={() => {}}
							isDragOverlay
						/>
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
