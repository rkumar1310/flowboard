import { useState, useEffect, useRef } from 'react';

interface TodoFormProps {
	initialTitle?: string;
	initialDescription?: string;
	onSubmit: (title: string, description?: string) => void;
	onCancel: () => void;
	submitLabel: string;
}

export function TodoForm({
	initialTitle = '',
	initialDescription = '',
	onSubmit,
	onCancel,
	submitLabel,
}: TodoFormProps) {
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

	return (
		<form className="todo-form" onSubmit={handleSubmit}>
			<input
				ref={inputRef}
				type="text"
				placeholder="Todo title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
			/>
			<input
				type="text"
				placeholder="Description (optional)"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
			/>
			<div className="form-actions">
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
