export interface Task {
  id: string
  text: string
  done: boolean
  createdAt: number
  completedAt: number | null
}

export type Filter = 'all' | 'active' | 'done'

export const MAX_LENGTH = 140
export const STORAGE_KEY = 'forma:tasks:v1'

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

/** Нормализует ввод: убирает пробелы по краям, схлопывает внутренние пробелы и переводы строк. */
export function normalizeText(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim()
}

export type ValidationResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'empty' | 'too-long' }

export function validateText(raw: string): ValidationResult {
  const text = normalizeText(raw)
  if (!text) return { ok: false, reason: 'empty' }
  if (text.length > MAX_LENGTH) return { ok: false, reason: 'too-long' }
  return { ok: true, text }
}

export function makeTask(text: string, now = Date.now()): Task {
  return { id: createId(), text, done: false, createdAt: now, completedAt: null }
}

/** Приводит неизвестное значение к Task или возвращает null. Никогда не бросает. */
export function sanitizeTask(value: unknown): Task | null {
  if (typeof value !== 'object' || value === null) return null
  const v = value as Record<string, unknown>
  if (typeof v.id !== 'string' || !v.id) return null
  if (typeof v.text !== 'string') return null
  const text = normalizeText(v.text).slice(0, MAX_LENGTH)
  if (!text) return null
  const createdAt =
    typeof v.createdAt === 'number' && Number.isFinite(v.createdAt) ? v.createdAt : Date.now()
  const done = v.done === true
  const completedAt =
    done && typeof v.completedAt === 'number' && Number.isFinite(v.completedAt)
      ? v.completedAt
      : null
  return { id: v.id, text, done, createdAt, completedAt }
}

/** Разбирает сырую строку из хранилища; битые элементы отбрасываются поштучно. */
export function parseTasks(raw: string | null): Task[] {
  if (!raw) return []
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
  const seen = new Set<string>()
  const result: Task[] = []
  for (const item of data) {
    const task = sanitizeTask(item)
    if (task && !seen.has(task.id)) {
      seen.add(task.id)
      result.push(task)
    }
  }
  return result
}

export interface LoadResult {
  tasks: Task[]
  error: boolean
}

function safeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

export function loadTasks(storage: Pick<Storage, 'getItem'> | null = safeStorage()): LoadResult {
  if (!storage) return { tasks: [], error: true }
  try {
    return { tasks: parseTasks(storage.getItem(STORAGE_KEY)), error: false }
  } catch {
    return { tasks: [], error: true }
  }
}

export function saveTasks(
  tasks: Task[],
  storage: Pick<Storage, 'setItem'> | null = safeStorage(),
): boolean {
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    return true
  } catch {
    return false
  }
}

// ---------- Reducer ----------

export type Action =
  | { type: 'add'; task: Task }
  | { type: 'toggle'; id: string; now?: number }
  | { type: 'remove'; id: string }
  | { type: 'edit'; id: string; text: string }
  | { type: 'clearDone' }
  | { type: 'replace'; tasks: Task[] }
  | { type: 'restore'; tasks: Task[] }

export function tasksReducer(state: Task[], action: Action): Task[] {
  switch (action.type) {
    case 'add':
      return state.some((t) => t.id === action.task.id) ? state : [action.task, ...state]
    case 'toggle':
      return state.map((t) =>
        t.id === action.id
          ? { ...t, done: !t.done, completedAt: t.done ? null : (action.now ?? Date.now()) }
          : t,
      )
    case 'remove':
      return state.filter((t) => t.id !== action.id)
    case 'edit':
      return state.map((t) => (t.id === action.id ? { ...t, text: action.text } : t))
    case 'clearDone':
      return state.filter((t) => !t.done)
    case 'replace':
      return action.tasks
    case 'restore': {
      const ids = new Set(state.map((t) => t.id))
      return [...state, ...action.tasks.filter((t) => !ids.has(t.id))].sort(
        (a, b) => b.createdAt - a.createdAt,
      )
    }
  }
}

export interface Stats {
  total: number
  done: number
  active: number
  percent: number
}

export function getStats(tasks: Task[]): Stats {
  const total = tasks.length
  const done = tasks.filter((t) => t.done).length
  return { total, done, active: total - done, percent: total ? Math.round((done / total) * 100) : 0 }
}

export function filterTasks(tasks: Task[], filter: Filter): Task[] {
  if (filter === 'active') return tasks.filter((t) => !t.done)
  if (filter === 'done') return tasks.filter((t) => t.done)
  return tasks
}

const RU_PLURAL = new Intl.PluralRules('ru')
export function plural(n: number, one: string, few: string, many: string): string {
  const cat = RU_PLURAL.select(n)
  return cat === 'one' ? one : cat === 'few' ? few : many
}
