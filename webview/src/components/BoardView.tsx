import { useState } from 'react';
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
import { Board, Task } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

interface BoardViewProps {
	board: Board;
	onBoardChange: (board: Board) => void;
}

export function BoardView({ board, onBoardChange }: BoardViewProps) {
	const [activeTask, setActiveTask] = useState<Task | null>(null);

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

	const findTask = (taskId: string): { task: Task; columnId: string } | null => {
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
		if (!over) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		const activeColumnId = findColumnByTaskId(activeId);
		let overColumnId = findColumnByTaskId(overId);

		if (!overColumnId) {
			const column = board.columns.find((c) => c.id === overId);
			if (column) {
				overColumnId = column.id;
			}
		}

		if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
			return;
		}

		const activeColumn = board.columns.find((c) => c.id === activeColumnId);
		const overColumn = board.columns.find((c) => c.id === overColumnId);

		if (!activeColumn || !overColumn) return;

		const activeTaskIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
		const activeTaskItem = activeColumn.tasks[activeTaskIndex];

		const newColumns = board.columns.map((column) => {
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

		onBoardChange({ columns: newColumns });
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveTask(null);

		if (!over) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		const activeColumnId = findColumnByTaskId(activeId);
		let overColumnId = findColumnByTaskId(overId);

		if (!overColumnId) {
			const column = board.columns.find((c) => c.id === overId);
			if (column) {
				overColumnId = column.id;
			}
		}

		if (!activeColumnId || !overColumnId) return;

		if (activeColumnId === overColumnId) {
			const column = board.columns.find((c) => c.id === activeColumnId);
			if (!column) return;

			const oldIndex = column.tasks.findIndex((t) => t.id === activeId);
			const newIndex = column.tasks.findIndex((t) => t.id === overId);

			if (oldIndex !== newIndex && newIndex >= 0) {
				const newColumns = board.columns.map((col) => {
					if (col.id === activeColumnId) {
						return {
							...col,
							tasks: arrayMove(col.tasks, oldIndex, newIndex),
						};
					}
					return col;
				});
				onBoardChange({ columns: newColumns });
			}
		}
	};

	const handleAddTask = (columnId: string, title: string, description?: string) => {
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

		onBoardChange(newBoard);
	};

	const handleEditTask = (taskId: string, title: string, description?: string) => {
		const newBoard = {
			columns: board.columns.map((col) => ({
				...col,
				tasks: col.tasks.map((task) =>
					task.id === taskId ? { ...task, title, description } : task
				),
			})),
		};

		onBoardChange(newBoard);
	};

	const handleDeleteTask = (taskId: string) => {
		const newBoard = {
			columns: board.columns.map((col) => ({
				...col,
				tasks: col.tasks.filter((task) => task.id !== taskId),
			})),
		};

		onBoardChange(newBoard);
	};

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
