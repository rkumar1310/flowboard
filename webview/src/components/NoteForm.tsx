import { useState, useEffect, useRef } from 'react';

interface NoteFormProps {
	initialTitle?: string;
	initialContent?: string;
	onSubmit: (title: string, content?: string) => void;
	onCancel: () => void;
	submitLabel: string;
}

export function NoteForm({
	initialTitle = '',
	initialContent = '',
	onSubmit,
	onCancel,
	submitLabel,
}: NoteFormProps) {
	const [title, setTitle] = useState(initialTitle);
	const [content, setContent] = useState(initialContent);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (title.trim()) {
			onSubmit(title.trim(), content.trim() || undefined);
		}
	};

	return (
		<form className="note-form" onSubmit={handleSubmit}>
			<input
				ref={inputRef}
				type="text"
				placeholder="Note title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
			/>
			<textarea
				placeholder="Content (optional)"
				value={content}
				onChange={(e) => setContent(e.target.value)}
				rows={3}
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
