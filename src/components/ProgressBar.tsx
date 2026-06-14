interface ProgressBarProps {
  value: number
  max: number
  label?: string
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ value, max, label, showLabel = true }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const color = pct === 100 ? 'bg-pixel-cyan' : pct >= 50 ? 'bg-pixel-red' : 'bg-pixel-border'

  return (
    <div className="w-full">
      <div className="w-full h-3 bg-pixel-bg border border-pixel-border">
        <div
          className={`h-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-pixel-muted mt-1">
          {value} / {max} ({pct}%)
        </div>
      )}
    </div>
  )
}
