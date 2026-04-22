export type AppView = 'game' | 'history';

interface TabBarProps {
  view: AppView;
  onSelect: (view: AppView) => void;
  historyCount: number;
}

export function TabBar({ view, onSelect, historyCount }: TabBarProps) {
  const tabs: { id: AppView; label: string; count?: number }[] = [
    { id: 'game', label: 'Game' },
    { id: 'history', label: 'History', count: historyCount },
  ];

  return (
    <div
      className="flex mb-6 rounded-xl p-1 gap-1"
      style={{ backgroundColor: 'var(--sp-card)', border: '1px solid var(--sp-border)' }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: view === tab.id ? 'var(--sp-accent)' : 'transparent',
            color: view === tab.id ? 'var(--sp-accent-text)' : 'var(--sp-text-muted)',
          }}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className="text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center tabular-nums"
              style={{
                backgroundColor: view === tab.id ? 'rgba(0,0,0,0.15)' : 'var(--sp-border)',
                color: view === tab.id ? 'var(--sp-accent-text)' : 'var(--sp-text-subtle)',
              }}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
