import { useState } from 'react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';
import { isValidState } from '../hooks/useGameState';
import type { GameAction } from '../hooks/useGameState';

interface SettingsPanelProps {
  dispatch?: React.Dispatch<GameAction>;
}

export function SettingsPanel({ dispatch }: SettingsPanelProps) {
  const { mode, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const modes: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  function handleImport() {
    setImportError('');
    setImportSuccess(false);
    try {
      const match = linkText.match(/[#?&]state=([^&]*)/);
      if (!match) {
        setImportError('Invalid link — no state parameter found');
        return;
      }
      const decoded: unknown = JSON.parse(atob(decodeURIComponent(match[1])));
      if (!isValidState(decoded)) {
        setImportError('Invalid link — could not parse game state');
        return;
      }
      dispatch?.({ type: 'LOAD_STATE', state: decoded });
      setLinkText('');
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 2000);
    } catch {
      setImportError('Invalid link — could not decode');
    }
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs transition-colors flex items-center gap-1"
        style={{ color: 'var(--sp-text-muted)' }}
        aria-expanded={open}
      >
        Settings {open ? '▴' : '▾'}
      </button>

      <div
        style={{
          maxHeight: open ? '400px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 300ms ease-in-out',
        }}
      >
        <div
          className="mt-3 p-4 rounded-xl space-y-4"
          style={{ backgroundColor: 'var(--sp-card)', border: '1px solid var(--sp-border)' }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--sp-text-subtle)' }}>
              Appearance
            </p>
            <div className="flex gap-2">
              {modes.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: mode === value ? 'var(--sp-accent)' : 'var(--sp-border)',
                    color: mode === value ? 'var(--sp-accent-text)' : 'var(--sp-text-secondary)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {dispatch && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'var(--sp-text-subtle)' }}>
                Import Game Link
              </p>
              <input
                type="text"
                value={linkText}
                onChange={(e) => { setLinkText(e.target.value); setImportError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleImport(); }}
                placeholder="Paste a web or app game link…"
                className="w-full rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--sp-bg)',
                  border: '1px solid var(--sp-border)',
                  color: 'var(--sp-text-primary)',
                }}
                autoCapitalize="none"
                autoCorrect="off"
              />
              {importError && (
                <p className="text-xs mb-2" style={{ color: 'var(--sp-danger)' }}>{importError}</p>
              )}
              {importSuccess && (
                <p className="text-xs mb-2" style={{ color: 'var(--sp-positive)' }}>Game loaded!</p>
              )}
              <button
                type="button"
                onClick={handleImport}
                disabled={!linkText.trim()}
                className="w-full py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }}
              >
                Import Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
