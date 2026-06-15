import { useEffect, useState } from 'react'

export interface SSEMessage {
  type: string
  count?: number
}

export function useSSE(token: string | null) {
  const [messages, setMessages] = useState<SSEMessage[]>([])

  useEffect(() => {
    if (!token) return

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    const controller = new AbortController()

    async function connect() {
      try {
        const res = await fetch(`${apiBase}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })

        if (!res.ok || !res.body) return

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() ?? ''

          for (const chunk of lines) {
            const dataLine = chunk.split('\n').find(l => l.startsWith('data:'))
            if (dataLine) {
              try {
                const msg = JSON.parse(dataLine.slice(5).trim()) as SSEMessage
                setMessages(prev => [...prev.slice(-9), msg])
              } catch {
                // non-JSON event (keepalive/heartbeat), ignore
              }
            }
          }
        }
      } catch {
        // connection closed or aborted — expected on unmount
      }
    }

    connect()
    return () => controller.abort()
  }, [token])

  return messages
}
