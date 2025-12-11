import { useState, useMemo } from 'react';
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
	rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Note } from '../types';
import { NoteCard } from './NoteCard';
import { NoteForm } from './NoteForm';

interface NotesViewProps {
	notes: Note[];
	onNotesChange: (notes: Note[]) => void;
}

export function NotesView({ notes, onNotesChange }: NotesViewProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [isAdding, setIsAdding] = useState(false);
	const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
	const [activeNote, setActiveNote] = useState<Note | null>(null);

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

	const filteredNotes = useMemo(() => {
		if (!searchQuery.trim()) return notes;
		const q = searchQuery.toLowerCase();
		return notes.filter(
			(n) =>
				n.title.toLowerCase().includes(q) ||
				n.content?.toLowerCase().includes(q)
		);
	}, [notes, searchQuery]);

	const handleDragStart = (event: DragStartEvent) => {
		const note = notes.find((n) => n.id === event.active.id);
		if (note) setActiveNote(note);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveNote(null);

		if (over && active.id !== over.id) {
			const oldIndex = notes.findIndex((n) => n.id === active.id);
			const newIndex = notes.findIndex((n) => n.id === over.id);
			onNotesChange(arrayMove(notes, oldIndex, newIndex));
		}
	};

	const handleAddNote = (title: string, content?: string) => {
		const newNote: Note = {
			id: Math.random().toString(36).substring(2, 11),
			title,
			content,
		};
		onNotesChange([...notes, newNote]);
		setIsAdding(false);
	};

	const handleEditNote = (noteId: string, title: string, content?: string) => {
		onNotesChange(
			notes.map((n) => (n.id === noteId ? { ...n, title, content } : n))
		);
		setEditingNoteId(null);
	};

	const handleDeleteNote = (noteId: string) => {
		onNotesChange(notes.filter((n) => n.id !== noteId));
	};

	return (
		<div className="notes-view">
			<div className="notes-header">
				<div className="search-bar">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
					</svg>
					<input
						type="text"
						placeholder="Search notes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					{searchQuery && (
						<button
							className="clear-search"
							onClick={() => setSearchQuery('')}
							title="Clear search"
						>
							<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
								<path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z" />
							</svg>
						</button>
					)}
				</div>
				<button
					className="btn btn-primary add-note-btn"
					onClick={() => setIsAdding(true)}
				>
					+ Add note
				</button>
			</div>

			{isAdding && (
				<div className="note-form-container">
					<NoteForm
						onSubmit={handleAddNote}
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
				<SortableContext items={filteredNotes} strategy={rectSortingStrategy}>
					<div className="notes-grid">
						{filteredNotes.map((note) =>
							editingNoteId === note.id ? (
								<div key={note.id} className="note-form-container">
									<NoteForm
										initialTitle={note.title}
										initialContent={note.content}
										onSubmit={(title, content) =>
											handleEditNote(note.id, title, content)
										}
										onCancel={() => setEditingNoteId(null)}
										submitLabel="Save"
									/>
								</div>
							) : (
								<NoteCard
									key={note.id}
									note={note}
									onEdit={() => setEditingNoteId(note.id)}
									onDelete={handleDeleteNote}
								/>
							)
						)}
					</div>
				</SortableContext>
				<DragOverlay>
					{activeNote ? (
						<NoteCard
							note={activeNote}
							onEdit={() => {}}
							onDelete={() => {}}
							isDragOverlay
						/>
					) : null}
				</DragOverlay>
			</DndContext>

			{filteredNotes.length === 0 && !isAdding && (
				<div className="empty-state">
					{searchQuery ? (
						<p>No notes match your search</p>
					) : (
						<p>No notes yet. Click "+ Add note" to create one.</p>
					)}
				</div>
			)}
		</div>
	);
}
