import { useCallback, useEffect, useRef, useState } from 'react'

export interface Toast {
  id: number
  message: string
  tone: 'default' | 'error'
  action?: { label: string; run: () => void }
}

const LIFETIME = 4500
const MAX_VISIBLE = 3

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<number, number>())
  const counter = useRef(0)

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id)
    if (t) window.clearTimeout(t)
    timers.current.delete(id)
    setToasts((list) => list.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (message: string, opts: { tone?: Toast['tone']; action?: Toast['action'] } = {}) => {
      const id = ++counter.current
      // одинаковое уведомление подряд заменяет предыдущее, а не копится стопкой
      setToasts((list) =>
        [...list.filter((x) => opts.action || x.message !== message), { id, message, tone: opts.tone ?? 'default', action: opts.action }].slice(-MAX_VISIBLE),
      )
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), opts.action ? LIFETIME + 1500 : LIFETIME),
      )
    },
    [dismiss],
  )

  useEffect(() => {
    const map = timers.current
    return () => map.forEach((t) => window.clearTimeout(t))
  }, [])

  return { toasts, push, dismiss }
}
