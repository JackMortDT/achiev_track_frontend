'use client'

import { useState } from 'react'
import { Game, Achievement } from '@/lib/api'

type PickerMode = 'single-game' | 'multi-game' | 'multi-achievement'

interface ShowcasePickerProps {
  mode: PickerMode
  maxSelect: number
  initialSelected?: string[]
  items: Game[] | Achievement[]
  onConfirm: (ids: string[]) => Promise<void>
  onClose: () => void
}

export function ShowcasePicker({
  mode,
  maxSelect,
  initialSelected = [],
  items,
  onConfirm,
  onClose,
}: ShowcasePickerProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected)
  const [saving, setSaving] = useState(false)

  function getItemId(item: Game | Achievement): string {
    if (mode === 'multi-achievement') return (item as Achievement).user_achievement_id ?? ''
    return (item as Game).game_id
  }

  function getItemLabel(item: Game | Achievement): string {
    return 'title' in item ? item.title : ''
  }

  function getItemSublabel(item: Game | Achievement): string {
    if (mode === 'multi-achievement') {
      const a = item as Achievement
      return `${a.game_title} · +${a.points} pts`
    }
    const g = item as Game
    return `${g.platform.toUpperCase()} · ${g.unlocked_count}/${g.total_achievements}`
  }

  function toggle(id: string) {
    if (mode === 'single-game') {
      setSelected([id])
      return
    }
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < maxSelect ? [...prev, id] : prev
    )
  }

  async function handleConfirm() {
    setSaving(true)
    try {
      await onConfirm(selected)
    } finally {
      setSaving(false)
    }
  }

  const title =
    mode === 'single-game' ? 'Elegir juego favorito' :
    mode === 'multi-game' ? `Expositor de juegos (máx. ${maxSelect})` :
    `Logros destacados (máx. ${maxSelect})`

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-pixel-bg border-2 border-pixel-border w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-pixel-border">
          <h2 className="text-pixel-cyan text-sm font-mono">{title}</h2>
          <button
            onClick={onClose}
            className="text-pixel-muted text-xs font-mono hover:text-pixel-red"
          >
            [X]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {items.length === 0 && (
            <p className="text-pixel-muted text-xs text-center py-8">
              No hay elementos disponibles.
            </p>
          )}
          {(items as (Game | Achievement)[]).map(item => {
            const id = getItemId(item)
            const isSelected = selected.includes(id)
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={`w-full flex items-center gap-3 p-2 text-left border transition-colors ${
                  isSelected
                    ? 'border-pixel-cyan bg-pixel-surface'
                    : 'border-pixel-border hover:border-pixel-cyan/50'
                }`}
              >
                <span className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 text-xs ${
                  isSelected ? 'border-pixel-cyan text-pixel-cyan' : 'border-pixel-border'
                }`}>
                  {isSelected ? '✓' : ''}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-pixel-text text-xs font-mono truncate">{getItemLabel(item)}</p>
                  <p className="text-pixel-muted text-xs truncate">{getItemSublabel(item)}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-pixel-border">
          <p className="text-pixel-muted text-xs">
            {selected.length}/{maxSelect} seleccionados
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-pixel-muted text-xs border border-pixel-border px-3 py-1 font-mono"
            >
              CANCELAR
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="bg-pixel-red text-white text-xs px-4 py-1 font-mono disabled:opacity-50"
            >
              {saving ? 'GUARDANDO...' : 'GUARDAR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
