import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  STORAGE_KEY,
  loadTasks,
  parseTasks,
  saveTasks,
  tasksReducer,
  type Action,
  type Task,
} from '../lib/tasks'

interface Init {
  tasks: Task[]
  loadError: boolean
}

export function useTasks() {
  const [init] = useState<Init>(() => {
    const r = loadTasks()
    return { tasks: r.tasks, loadError: r.error }
  })
  const [tasks, dispatch] = useReducer(tasksReducer, init.tasks)
  const [saveError, setSaveError] = useState(init.loadError)
  const lastSaved = useRef<string | null>(null)
  const first = useRef(true)

  // Сохраняем только после реальных изменений, чтобы не затирать данные при ошибке чтения.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const serialized = JSON.stringify(tasks)
    if (serialized === lastSaved.current) return
    const ok = saveTasks(tasks)
    if (ok) lastSaved.current = serialized
    setSaveError(!ok)
  }, [tasks])

  // Синхронизация между вкладками.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY && e.key !== null) return
      const next = parseTasks(e.newValue)
      lastSaved.current = JSON.stringify(next)
      dispatch({ type: 'replace', tasks: next })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const send = useCallback((a: Action) => dispatch(a), [])
  return { tasks, dispatch: send, saveError }
}
