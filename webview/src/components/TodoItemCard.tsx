import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TodoItem } from '../types';

interface TodoItemCardProps {
	todo: TodoItem;
	onToggle: (todoId: string) => void;
	onEdit: () => void;
	onDelete: (todoId: string) => void;
	isDragOverlay?: boolean;
}

export function TodoItemCard({
	todo,
	onToggle,
	onEdit,
	onDelete,
	isDragOverlay,
}: TodoItemCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: todo.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`todo-item ${todo.completed ? 'completed' : ''} ${isDragOverlay ? 'drag-overlay' : ''}`}
			{...attributes}
			{...listeners}
		>
			<label className="todo-checkbox">
				<input
					type="checkbox"
					checked={todo.completed}
					onChange={() => onToggle(todo.id)}
					onClick={(e) => e.stopPropagation()}
				/>
				<span className="checkmark"></span>
			</label>
			<div className="todo-content">
				<p className="todo-title">{todo.title}</p>
				{todo.description && <p className="todo-description">{todo.description}</p>}
			</div>
			{!isDragOverlay && (
				<div className="card-actions">
					<button
						className="icon-button"
						onClick={(e) => {
							e.stopPropagation();
							onEdit();
						}}
						title="Edit todo"
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
							<path d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3.42 1.91 1.91-3.42 1.51zm3.83-2.06L4.47 9.76l6.69-6.69 1.77 1.77-6.69 6.69z" />
						</svg>
					</button>
					<button
						className="icon-button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(todo.id);
						}}
						title="Delete todo"
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
							<path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z" />
						</svg>
					</button>
				</div>
			)}
		</div>
	);
}
