import { GameAchievement } from '@/lib/api'

interface Props {
  items: GameAchievement[]
  totalAchievements: number
  playtimeHours: number
}

export function MaestryTrophyCard({ items, totalAchievements, playtimeHours }: Props) {
  const totalPoints = items
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0)

  const lastUnlockedAt = items
    .filter(a => a.unlocked && a.unlocked_at != null)
    .map(a => a.unlocked_at as string)
    .sort()
    .at(-1)

  const lastDate = lastUnlockedAt
    ? new Date(lastUnlockedAt).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    : null

  return (
    <div className="relative border-2 border-[#b06aff] bg-gradient-to-br from-[#130a1a] via-[#1a1000] to-[#0d0d0d] p-4 flex items-center gap-4 overflow-hidden">
      {/* Barra lateral animada */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#b06aff] via-[#ffd700] to-[#b06aff] animate-[glow-pulse_2s_ease-in-out_infinite_alternate]" />

      {/* Ícono trofeo */}
      <div className="text-5xl flex-shrink-0 pl-1" style={{ filter: 'drop-shadow(0 0 8px #ffd700)' }}>
        🏆
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[#ffd700] font-mono text-sm uppercase tracking-widest mb-1">
          Platino del jugador
        </h3>
        {lastDate && (
          <p className="text-pixel-muted font-mono text-xs mb-3">
            Todos los logros desbloqueados · {lastDate}
          </p>
        )}
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[#b06aff] font-mono text-base">{totalAchievements}</span>
            <span className="text-pixel-muted font-mono text-[9px] uppercase">logros</span>
          </div>
          {totalPoints > 0 && (
            <div className="flex flex-col">
              <span className="text-[#b06aff] font-mono text-base">{totalPoints}</span>
              <span className="text-pixel-muted font-mono text-[9px] uppercase">puntos</span>
            </div>
          )}
          {playtimeHours > 0 && (
            <div className="flex flex-col">
              <span className="text-[#b06aff] font-mono text-base">{playtimeHours}h</span>
              <span className="text-pixel-muted font-mono text-[9px] uppercase">jugadas</span>
            </div>
          )}
        </div>
      </div>

      {/* Barra lateral derecha (espejo) */}
      <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#ffd700] via-[#b06aff] to-[#ffd700] animate-[glow-pulse_2s_ease-in-out_infinite_alternate]" />
    </div>
  )
}
