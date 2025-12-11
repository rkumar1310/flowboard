import { useState, useRef, useEffect } from 'react';

interface TaskFormProps {
	onSubmit: (title: string, description?: string) => void;
	onCancel: () => void;
	initialTitle?: string;
	initialDescription?: string;
	submitLabel?: string;
}

export function TaskForm({
	onSubmit,
	onCancel,
	initialTitle = '',
	initialDescription = '',
	submitLabel = 'Add',
}: TaskFormProps) {
	const [title, setTitle] = useState(initialTitle);
	const [description, setDescription] = useState(initialDescription);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (title.trim()) {
			onSubmit(title.trim(), description.trim() || undefined);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			onCancel();
		}
	};

	return (
		<form className="task-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
			<input
				ref={inputRef}
				type="text"
				placeholder="Task title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
			/>
			<textarea
				placeholder="Description (optional)"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
			/>
			<div className="task-form-actions">
				<button type="button" className="btn btn-secondary" onClick={onCancel}>
					Cancel
				</button>
				<button type="submit" className="btn btn-primary" disabled={!title.trim()}>
					{submitLabel}
				</button>
			</div>
		</form>
	);
}
