import React, { useEffect } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 z-10"
        style={{ backgroundColor: 'var(--sp-card)', border: '1px solid var(--sp-border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ color: 'var(--sp-text-primary)' }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm"
            style={{ color: 'var(--sp-text-muted)' }}
          >
            Cancel
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
