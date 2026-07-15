import { GameAchievement } from '@/lib/api'
import { RareTrophyCard } from './RareTrophyCard'

const RARE_THRESHOLD = 10
const MAX_CARDS = 8
const FALLBACK_CARDS = 5

interface Props {
  items: GameAchievement[]
  isMastered: boolean
}

export function RareStrip({ items, isMastered }: Props) {
  const withRarity = items.filter(a => a.rarity_pct != null)

  const byThreshold = withRarity
    .filter(a => (a.rarity_pct as number) <= RARE_THRESHOLD)
    .sort((a, b) => (a.rarity_pct as number) - (b.rarity_pct as number))
    .slice(0, MAX_CARDS)

  const isFallback = byThreshold.length === 0
  const rare = isFallback
    ? withRarity
        .sort((a, b) => (a.rarity_pct as number) - (b.rarity_pct as number))
        .slice(0, FALLBACK_CARDS)
    : byThreshold

  if (rare.length === 0) return null

  const unlockedRare = rare.filter(a => a.unlocked).length
  const title = isFallback ? '📊 Logros más raros de este juego' : '🏆 Trofeos raros'

  return (
    <section>
      <h2 className="text-pixel-cyan text-xs uppercase tracking-widest border-l-2 border-pixel-red pl-3 mb-2 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-pixel-muted font-mono text-[10px] normal-case tracking-normal border-0 pl-0">
          {unlockedRare}/{rare.length} obtenidos
        </span>
      </h2>

      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-1 pr-8" style={{ scrollbarWidth: 'none' }}>
          {rare.map(ach => (
            <RareTrophyCard key={ach.achievement_id} ach={ach} isMastery={isMastered} />
          ))}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-[#0d0d0d] to-transparent" />
      </div>
    </section>
  )
}
