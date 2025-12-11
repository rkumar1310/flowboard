export type TabType = 'board' | 'notes' | 'todo';

interface TabBarProps {
	activeTab: TabType;
	onTabChange: (tab: TabType) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
	const tabs: { id: TabType; label: string }[] = [
		{ id: 'board', label: 'Board' },
		{ id: 'notes', label: 'Notes' },
		{ id: 'todo', label: 'Todo' },
	];

	return (
		<div className="tab-bar">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
					onClick={() => onTabChange(tab.id)}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}
