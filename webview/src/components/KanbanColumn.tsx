import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Task } from '../types';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';

interface KanbanColumnProps {
	column: Column;
	onAddTask: (columnId: string, title: string, description?: string) => void;
	onEditTask: (taskId: string, title: string, description?: string) => void;
	onDeleteTask: (taskId: string) => void;
}

export function KanbanColumn({
	column,
	onAddTask,
	onEditTask,
	onDeleteTask,
}: KanbanColumnProps) {
	const [isAddingTask, setIsAddingTask] = useState(false);
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

	const { setNodeRef } = useDroppable({ id: column.id });

	const handleAddTask = (title: string, description?: string) => {
		onAddTask(column.id, title, description);
		setIsAddingTask(false);
	};

	const handleEditTask = (taskId: string) => (title: string, description?: string) => {
		onEditTask(taskId, title, description);
		setEditingTaskId(null);
	};

	return (
		<div className="column">
			<div className="column-header">
				<h2 className="column-title">{column.title}</h2>
				<span className="task-count">{column.tasks.length}</span>
			</div>

			<div className="cards" ref={setNodeRef}>
				<SortableContext
					items={column.tasks.map((t) => t.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="cards-drop-area">
						{column.tasks.map((task) =>
							editingTaskId === task.id ? (
								<TaskForm
									key={task.id}
									onSubmit={handleEditTask(task.id)}
									onCancel={() => setEditingTaskId(null)}
									initialTitle={task.title}
									initialDescription={task.description}
									submitLabel="Save"
								/>
							) : (
								<TaskCard
									key={task.id}
									task={task}
									onEdit={() => setEditingTaskId(task.id)}
									onDelete={onDeleteTask}
								/>
							)
						)}
					</div>
				</SortableContext>
			</div>

			{isAddingTask ? (
				<TaskForm
					onSubmit={handleAddTask}
					onCancel={() => setIsAddingTask(false)}
				/>
			) : (
				<button className="add-task-btn" onClick={() => setIsAddingTask(true)}>
					+ Add task
				</button>
			)}
		</div>
	);
}
