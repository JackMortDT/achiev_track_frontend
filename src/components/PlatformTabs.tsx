interface PlatformTabsProps {
  platforms: string[]
  selected: string
  onChange: (platform: string) => void
}

function platformLabel(p: string): string {
  if (p === 'all') return 'TODAS'
  if (p === 'retroachievements') return 'RA'
  return p.toUpperCase()
}

export function PlatformTabs({ platforms, selected, onChange }: PlatformTabsProps) {
  const all = ['all', ...platforms]

  return (
    <div className="flex gap-2 flex-wrap">
      {all.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1 text-xs font-mono border transition-colors ${
            selected === p
              ? 'border-pixel-red text-pixel-red bg-pixel-surface'
              : 'border-pixel-border text-pixel-muted hover:border-pixel-red'
          }`}
        >
          {platformLabel(p)}
        </button>
      ))}
    </div>
  )
}
