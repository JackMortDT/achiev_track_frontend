'use client'

import { useEffect, useState } from 'react'
import { SSEMessage } from '@/lib/useSSE'

interface NotificationToastProps {
  messages: SSEMessage[]
}

export function NotificationToast({ messages }: NotificationToastProps) {
  const [visible, setVisible] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last) return

    if (last.type === 'new_achievements' && last.count) {
      setText(`+${last.count} new achievement${last.count > 1 ? 's' : ''} unlocked!`)
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [messages])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-pixel-surface border-2 border-pixel-cyan shadow-pixel-cyan p-4 text-pixel-cyan font-mono text-sm animate-pulse">
      ★ {text}
    </div>
  )
}
