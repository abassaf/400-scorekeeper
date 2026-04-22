interface NumberStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}

export function NumberStepper({ value, min, max, onChange, label }: NumberStepperProps) {
  return (
    <div>
      <p className="text-xs mb-1 text-center" style={{ color: 'var(--sp-text-muted)' }}>{label}</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(value - 1, min))}
          disabled={value <= min}
          className="w-8 h-8 rounded-lg text-sm font-bold transition-colors disabled:opacity-30"
          style={{ backgroundColor: 'var(--sp-border)', color: 'var(--sp-text-primary)' }}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span
          className="flex-1 text-center text-sm font-semibold tabular-nums"
          style={{ color: 'var(--sp-text-primary)' }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(value + 1, max))}
          disabled={value >= max}
          className="w-8 h-8 rounded-lg text-sm font-bold transition-colors disabled:opacity-30"
          style={{ backgroundColor: 'var(--sp-border)', color: 'var(--sp-text-primary)' }}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
