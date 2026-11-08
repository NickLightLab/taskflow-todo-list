import { useEffect, useState } from 'react'

const fmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

/** Актуальная дата строкой; обновляется, если вкладка пережила полночь. */
export function useToday(): string {
  const [label, setLabel] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const tick = () => setLabel(fmt.format(new Date()))
    const id = window.setInterval(tick, 60_000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])
  return label
}
