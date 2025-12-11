import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';

interface TaskCardProps {
	task: Task;
	onEdit: () => void;
	onDelete: (taskId: string) => void;
	isDragOverlay?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, isDragOverlay }: TaskCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: task.id, disabled: isDragOverlay });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={isDragOverlay ? undefined : style}
			className={`card ${isDragging ? 'dragging' : ''}`}
			{...attributes}
			{...listeners}
		>
			<p className="card-title">{task.title}</p>
			{task.description && <p className="card-description">{task.description}</p>}
			{!isDragOverlay && (
				<div className="card-actions">
					<button
						className="icon-button"
						onClick={(e) => {
							e.stopPropagation();
							onEdit();
						}}
						title="Edit task"
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
							<path d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3.42 1.91 1.91-3.42 1.51zm3.83-2.06L4.47 9.76l6.69-6.69 1.77 1.77-6.69 6.69z" />
						</svg>
					</button>
					<button
						className="icon-button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(task.id);
						}}
						title="Delete task"
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
