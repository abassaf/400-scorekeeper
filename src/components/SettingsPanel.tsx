import { useState } from 'react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';

export function SettingsPanel() {
  const { mode, setMode } = useTheme();
  const [open, setOpen] = useState(false);

  const modes: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
        aria-expanded={open}
      >
        Settings {open ? '▴' : '▾'}
      </button>

      <div
        style={{
          maxHeight: open ? '200px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 300ms ease-in-out',
        }}
      >
        <div
          className="mt-3 p-4 rounded-xl border"
          style={{ backgroundColor: 'var(--sp-card)', borderColor: 'var(--sp-border)' }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--sp-text-subtle)' }}
          >
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
      </div>
    </div>
  );
}
