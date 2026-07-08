interface PlatformBadgeProps {
  platform: string
}

const RA_PLATFORMS = new Set([
  'gba', 'gbc', 'gb', 'snes', 'n64', 'nes', 'psx', 'ps2',
  'genesis', 'mastersystem', 'gamegear', 'arcade', 'atari2600',
  'atari7800', 'neogeo', 'pcengine', 'saturn', 'dreamcast',
  'nds', 'wonderswan', '32x', 'segacd', 'retroachievements'
])

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const label = platform === 'retroachievements' ? 'RA' : platform.toUpperCase()
  const isRA = RA_PLATFORMS.has(platform)
  const colors = platform === 'steam'
    ? 'bg-pixel-steam border-pixel-cyan text-pixel-cyan'
    : platform === 'psn'
    ? 'bg-pixel-surface border-blue-400 text-blue-400'
    : isRA
    ? 'bg-pixel-surface border-pixel-ra text-pixel-ra'
    : 'bg-pixel-surface border-pixel-border text-pixel-text'

  return (
    <span className={`inline-block px-2 py-0.5 text-xs border font-mono ${colors}`}>
      {label}
    </span>
  )
}
