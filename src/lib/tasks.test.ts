import { describe, expect, it } from 'vitest'
import {
  MAX_LENGTH,
  STORAGE_KEY,
  filterTasks,
  getStats,
  loadTasks,
  makeTask,
  parseTasks,
  plural,
  saveTasks,
  tasksReducer,
  validateText,
} from './tasks'

const memory = (initial: Record<string, string> = {}) => {
  const data = { ...initial }
  return {
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => void (data[k] = v),
  }
}

describe('validateText', () => {
  it('rejects empty and whitespace-only', () => {
    expect(validateText('')).toEqual({ ok: false, reason: 'empty' })
    expect(validateText('   \n\t ')).toEqual({ ok: false, reason: 'empty' })
  })
  it('trims and collapses whitespace', () => {
    expect(validateText('  купить   хлеб \n')).toEqual({ ok: true, text: 'купить хлеб' })
  })
  it('rejects too long text', () => {
    expect(validateText('а'.repeat(MAX_LENGTH + 1))).toEqual({ ok: false, reason: 'too-long' })
    expect(validateText('а'.repeat(MAX_LENGTH)).ok).toBe(true)
  })
})

describe('reducer', () => {
  it('adds several tasks with unique ids, newest first', () => {
    let s = tasksReducer([], { type: 'add', task: makeTask('a', 1) })
    s = tasksReducer(s, { type: 'add', task: makeTask('b', 2) })
    s = tasksReducer(s, { type: 'add', task: makeTask('c', 3) })
    expect(s.map((t) => t.text)).toEqual(['c', 'b', 'a'])
    expect(new Set(s.map((t) => t.id)).size).toBe(3)
  })
  it('toggles done and back', () => {
    const t = makeTask('a')
    let s = tasksReducer([t], { type: 'toggle', id: t.id, now: 99 })
    expect(s[0]).toMatchObject({ done: true, completedAt: 99 })
    s = tasksReducer(s, { type: 'toggle', id: t.id })
    expect(s[0]).toMatchObject({ done: false, completedAt: null })
  })
  it('removes, edits, clears done', () => {
    const a = makeTask('a')
    const b = makeTask('b')
    let s = tasksReducer([a, b], { type: 'edit', id: a.id, text: 'z' })
    expect(s[0].text).toBe('z')
    s = tasksReducer(s, { type: 'toggle', id: b.id })
    s = tasksReducer(s, { type: 'clearDone' })
    expect(s.map((t) => t.id)).toEqual([a.id])
    s = tasksReducer(s, { type: 'remove', id: a.id })
    expect(s).toEqual([])
  })
  it('restore puts tasks back in order without duplicates', () => {
    const a = makeTask('a', 1)
    const b = makeTask('b', 2)
    const s = tasksReducer([b], { type: 'restore', tasks: [a, b] })
    expect(s.map((t) => t.text)).toEqual(['b', 'a'])
  })
})

describe('storage', () => {
  it('round-trips tasks', () => {
    const st = memory()
    const tasks = [makeTask('a'), { ...makeTask('b'), done: true, completedAt: 5 }]
    expect(saveTasks(tasks, st)).toBe(true)
    expect(loadTasks(st).tasks).toEqual(tasks)
  })
  it('survives corrupted JSON', () => {
    expect(loadTasks(memory({ [STORAGE_KEY]: '{not json' })).tasks).toEqual([])
    expect(parseTasks('{"a":1}')).toEqual([])
    expect(parseTasks(null)).toEqual([])
  })
  it('drops only invalid items, keeps the rest', () => {
    const raw = JSON.stringify([
      { id: '1', text: 'ok', done: false, createdAt: 1 },
      null,
      42,
      { id: '', text: 'no id' },
      { id: '2', text: '   ' },
      { id: '1', text: 'dup' },
      { id: '3', text: 'fine', done: true, completedAt: 7, createdAt: 2 },
    ])
    const r = parseTasks(raw)
    expect(r.map((t) => t.id)).toEqual(['1', '3'])
    expect(r[1].done).toBe(true)
  })
  it('handles failing storage', () => {
    const bad = {
      getItem: (): string | null => {
        throw new Error('denied')
      },
      setItem: (): void => {
        throw new Error('quota')
      },
    }
    expect(loadTasks(bad)).toEqual({ tasks: [], error: true })
    expect(saveTasks([], bad)).toBe(false)
    expect(saveTasks([], null)).toBe(false)
  })
})

describe('stats & filters', () => {
  const a = makeTask('a')
  const b = { ...makeTask('b'), done: true, completedAt: 1 }
  it('computes stats', () => {
    expect(getStats([])).toEqual({ total: 0, done: 0, active: 0, percent: 0 })
    expect(getStats([a, b])).toEqual({ total: 2, done: 1, active: 1, percent: 50 })
  })
  it('filters', () => {
    expect(filterTasks([a, b], 'all')).toHaveLength(2)
    expect(filterTasks([a, b], 'active')).toEqual([a])
    expect(filterTasks([a, b], 'done')).toEqual([b])
  })
  it('pluralizes in Russian', () => {
    expect(plural(1, 'задача', 'задачи', 'задач')).toBe('задача')
    expect(plural(3, 'задача', 'задачи', 'задач')).toBe('задачи')
    expect(plural(11, 'задача', 'задачи', 'задач')).toBe('задач')
    expect(plural(21, 'задача', 'задачи', 'задач')).toBe('задача')
  })
})
