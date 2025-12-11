import { useState } from 'react';
import {
	DndContext,
	DragOverlay,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragStartEvent,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	SortableContext,
	sortableKeyboardCoordinates,
	arrayMove,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TodoItem } from '../types';
import { TodoItemCard } from './TodoItemCard';
import { TodoForm } from './TodoForm';

interface TodoViewProps {
	todos: TodoItem[];
	onTodosChange: (todos: TodoItem[]) => void;
}

export function TodoView({ todos, onTodosChange }: TodoViewProps) {
	const [isAdding, setIsAdding] = useState(false);
	const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
	const [activeTodo, setActiveTodo] = useState<TodoItem | null>(null);

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

	const handleDragStart = (event: DragStartEvent) => {
		const todo = todos.find((t) => t.id === event.active.id);
		if (todo) setActiveTodo(todo);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveTodo(null);

		if (over && active.id !== over.id) {
			const oldIndex = todos.findIndex((t) => t.id === active.id);
			const newIndex = todos.findIndex((t) => t.id === over.id);
			onTodosChange(arrayMove(todos, oldIndex, newIndex));
		}
	};

	const handleAddTodo = (title: string, description?: string) => {
		const newTodo: TodoItem = {
			id: Math.random().toString(36).substring(2, 11),
			title,
			description,
			completed: false,
		};
		onTodosChange([...todos, newTodo]);
		setIsAdding(false);
	};

	const handleEditTodo = (todoId: string, title: string, description?: string) => {
		onTodosChange(
			todos.map((t) => (t.id === todoId ? { ...t, title, description } : t))
		);
		setEditingTodoId(null);
	};

	const handleToggleTodo = (todoId: string) => {
		onTodosChange(
			todos.map((t) =>
				t.id === todoId ? { ...t, completed: !t.completed } : t
			)
		);
	};

	const handleDeleteTodo = (todoId: string) => {
		onTodosChange(todos.filter((t) => t.id !== todoId));
	};

	const pendingTodos = todos.filter((t) => !t.completed);
	const completedTodos = todos.filter((t) => t.completed);

	return (
		<div className="todo-view">
			<div className="todo-header">
				<h2>Todo List</h2>
				<button
					className="btn btn-primary"
					onClick={() => setIsAdding(true)}
				>
					+ Add todo
				</button>
			</div>

			{isAdding && (
				<div className="todo-form-container">
					<TodoForm
						onSubmit={handleAddTodo}
						onCancel={() => setIsAdding(false)}
						submitLabel="Add"
					/>
				</div>
			)}

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={todos} strategy={verticalListSortingStrategy}>
					<div className="todo-list">
						{pendingTodos.length > 0 && (
							<div className="todo-section">
								<h3>Pending ({pendingTodos.length})</h3>
								{pendingTodos.map((todo) =>
									editingTodoId === todo.id ? (
										<div key={todo.id} className="todo-form-container">
											<TodoForm
												initialTitle={todo.title}
												initialDescription={todo.description}
												onSubmit={(title, description) =>
													handleEditTodo(todo.id, title, description)
												}
												onCancel={() => setEditingTodoId(null)}
												submitLabel="Save"
											/>
										</div>
									) : (
										<TodoItemCard
											key={todo.id}
											todo={todo}
											onToggle={handleToggleTodo}
											onEdit={() => setEditingTodoId(todo.id)}
											onDelete={handleDeleteTodo}
										/>
									)
								)}
							</div>
						)}

						{completedTodos.length > 0 && (
							<div className="todo-section">
								<h3>Completed ({completedTodos.length})</h3>
								{completedTodos.map((todo) =>
									editingTodoId === todo.id ? (
										<div key={todo.id} className="todo-form-container">
											<TodoForm
												initialTitle={todo.title}
												initialDescription={todo.description}
												onSubmit={(title, description) =>
													handleEditTodo(todo.id, title, description)
												}
												onCancel={() => setEditingTodoId(null)}
												submitLabel="Save"
											/>
										</div>
									) : (
										<TodoItemCard
											key={todo.id}
											todo={todo}
											onToggle={handleToggleTodo}
											onEdit={() => setEditingTodoId(todo.id)}
											onDelete={handleDeleteTodo}
										/>
									)
								)}
							</div>
						)}
					</div>
				</SortableContext>
				<DragOverlay>
					{activeTodo ? (
						<TodoItemCard
							todo={activeTodo}
							onToggle={() => {}}
							onEdit={() => {}}
							onDelete={() => {}}
							isDragOverlay
						/>
					) : null}
				</DragOverlay>
			</DndContext>

			{todos.length === 0 && !isAdding && (
				<div className="empty-state">
					<p>No todos yet. Click "+ Add todo" to create one.</p>
				</div>
			)}
		</div>
	);
}
