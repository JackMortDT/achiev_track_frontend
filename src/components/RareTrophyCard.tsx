import { GameAchievement } from '@/lib/api'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface Props {
  ach: GameAchievement
  isMastery: boolean
}

export function RareTrophyCard({ ach, isMastery }: Props) {
  const borderClass = isMastery
    ? 'border-[#b06aff] shadow-[0_0_10px_#b06aff40]'
    : 'border-[#ffd700]'

  const bgClass = isMastery
    ? 'bg-gradient-to-br from-[#130a1a] to-[#0d0d0d]'
    : 'bg-gradient-to-br from-[#1a1500] to-[#0d0d0d]'

  const badgeClass = isMastery
    ? 'border-[#b06aff] text-[#b06aff]'
    : 'border-[#ffd700] text-[#ffd700]'

  const badgeLabel = isMastery
    ? 'MAESTRÍA'
    : ach.rarity_pct != null ? `TOP ${ach.rarity_pct}%` : 'RARO'

  return (
    <div className={`relative flex-shrink-0 w-24 flex flex-col items-center gap-1 p-2 border font-mono ${borderClass} ${bgClass} ${
      !ach.unlocked ? 'opacity-35' : ''
    } ${isMastery && ach.unlocked ? 'animate-[glow-pulse_2.5s_ease-in-out_infinite_alternate]' : ''}`}>
      {/* Checkmark */}
      {ach.unlocked && (
        <span className="absolute top-1 left-1 text-pixel-cyan text-[9px]">✓</span>
      )}

      {/* Icon */}
      <div className="w-10 h-10 flex items-center justify-center">
        {ach.image_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={ach.image_url} alt={ach.title} className="w-full h-full object-cover" />
          : <span className="text-2xl">{ach.unlocked ? '🏆' : '🔒'}</span>}
      </div>

      {/* Name */}
      <p className={`text-[9px] text-center leading-tight line-clamp-2 ${
        isMastery ? 'text-[#b06aff]' : 'text-[#ffd700]'
      }`}>
        {ach.title}
      </p>

      {/* Badge */}
      <span className={`text-[7px] border px-1 ${badgeClass}`}>
        {badgeLabel}
      </span>

      {/* Date */}
      {ach.unlocked && ach.unlocked_at && (
        <span className="text-[7px] text-pixel-muted">{formatDate(ach.unlocked_at)}</span>
      )}
    </div>
  )
}
