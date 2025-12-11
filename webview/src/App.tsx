import { useState, useEffect } from 'react';
import { FlowboardData, MessageToWebview, vscode } from './types';
import { TabBar, TabType } from './components/TabBar';
import { BoardView } from './components/BoardView';
import { NotesView } from './components/NotesView';
import { TodoView } from './components/TodoView';

type AppState = 'loading' | 'noWorkspace' | 'ready';

export default function App() {
	const [data, setData] = useState<FlowboardData | null>(null);
	const [appState, setAppState] = useState<AppState>('loading');
	const [activeTab, setActiveTab] = useState<TabType>('board');

	useEffect(() => {
		const handleMessage = (event: MessageEvent<MessageToWebview>) => {
			const message = event.data;
			switch (message.type) {
				case 'loadData':
					setData(message.data);
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

	const updateData = (newData: FlowboardData) => {
		setData(newData);
		vscode.postMessage({ type: 'updateData', data: newData });
	};

	if (appState === 'loading') {
		return <div className="loading">Loading...</div>;
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

	if (!data) {
		return <div className="loading">Loading...</div>;
	}

	return (
		<div className="app">
			<TabBar activeTab={activeTab} onTabChange={setActiveTab} />
			<div className="tab-content">
				{activeTab === 'board' && (
					<BoardView
						board={data.board}
						onBoardChange={(board) => updateData({ ...data, board })}
					/>
				)}
				{activeTab === 'notes' && (
					<NotesView
						notes={data.notes}
						onNotesChange={(notes) => updateData({ ...data, notes })}
					/>
				)}
				{activeTab === 'todo' && (
					<TodoView
						todos={data.todos}
						onTodosChange={(todos) => updateData({ ...data, todos })}
					/>
				)}
			</div>
		</div>
	);
}
