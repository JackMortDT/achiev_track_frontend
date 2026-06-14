interface PlatformBadgeProps {
  platform: 'steam' | 'retroachievements'
}

const PLATFORM_LABELS: Record<string, string> = {
  steam: 'STEAM',
  retroachievements: 'RA',
}

const PLATFORM_COLORS: Record<string, string> = {
  steam: 'bg-pixel-steam border-pixel-cyan text-pixel-cyan',
  retroachievements: 'bg-pixel-surface border-pixel-ra text-pixel-ra',
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const label = PLATFORM_LABELS[platform] ?? platform.toUpperCase()
  const colors = PLATFORM_COLORS[platform] ?? 'bg-pixel-surface border-pixel-border text-pixel-text'

  return (
    <span className={`inline-block px-2 py-0.5 text-xs border font-mono ${colors}`}>
      {label}
    </span>
  )
}
