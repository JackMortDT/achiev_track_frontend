import { GameAchievement } from '@/lib/api'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export function AchievementTile({ ach }: { ach: GameAchievement }) {
  return (
    <div className={`relative flex gap-2 items-center p-2 border bg-pixel-surface transition-colors ${
      ach.unlocked
        ? 'border-pixel-border hover:border-pixel-border/60'
        : 'border-pixel-border opacity-35'
    }`}>
      {/* Left accent bar */}
      {ach.unlocked && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-pixel-cyan/30" />
      )}

      {/* Icon */}
      <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border ${
        ach.unlocked ? 'border-pixel-cyan/20' : 'border-pixel-border'
      }`}>
        {ach.image_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={ach.image_url} alt={ach.title} className="w-full h-full object-cover" />
          : <span className="text-pixel-muted text-xs">{ach.unlocked ? '★' : '○'}</span>}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-mono truncate ${ach.unlocked ? 'text-pixel-text' : 'text-pixel-muted'}`}>
          {ach.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {ach.points > 0 && (
            <span className={`text-xs font-mono ${ach.unlocked ? 'text-pixel-red' : 'text-pixel-muted'}`}>
              +{ach.points}
            </span>
          )}
          {ach.unlocked && ach.unlocked_at && (
            <span className="text-pixel-muted text-xs">{formatDate(ach.unlocked_at)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
