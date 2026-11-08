import { useCallback, useMemo, useRef, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { TriangleAlert } from 'lucide-react'
import { Composer } from './components/Composer'
import { FilterNav } from './components/FilterNav'
import { Hero } from './components/Hero'
import { Logo } from './components/Logo'
import { ProgressCard } from './components/Progress'
import { Sidebar } from './components/Sidebar'
import { TaskList } from './components/TaskList'
import { Toasts } from './components/Toasts'
import { useTasks } from './hooks/useTasks'
import { useToasts } from './hooks/useToasts'
import { useToday } from './hooks/useToday'
import { filterTasks, getStats, makeTask, plural, type Filter, type Task } from './lib/tasks'

export default function App() {
  const { tasks, dispatch, saveError } = useTasks()
  const { toasts, push, dismiss } = useToasts()
  const [filter, setFilter] = useState<Filter>('all')
  const date = useToday()
  const inputRef = useRef<HTMLInputElement>(null)

  const stats = useMemo(() => getStats(tasks), [tasks])
  const visible = useMemo(() => filterTasks(tasks, filter), [tasks, filter])

  const add = useCallback(
    (text: string) => {
      dispatch({ type: 'add', task: makeTask(text) })
      // Новая задача должна быть видна сразу, даже если открыт раздел «Выполнено».
      setFilter((f) => (f === 'done' ? 'all' : f))
      push('Задача добавлена')
    },
    [dispatch, push],
  )

  const toggle = useCallback((id: string) => dispatch({ type: 'toggle', id }), [dispatch])

  const remove = useCallback(
    (task: Task) => {
      dispatch({ type: 'remove', id: task.id })
      push('Задача удалена', {
        action: { label: 'Отменить', run: () => dispatch({ type: 'restore', tasks: [task] }) },
      })
    },
    [dispatch, push],
  )

  const edit = useCallback(
    (id: string, text: string) => {
      dispatch({ type: 'edit', id, text })
      push('Изменения сохранены')
    },
    [dispatch, push],
  )

  const clearDone = useCallback(() => {
    const removed = tasks.filter((t) => t.done)
    if (!removed.length) return
    dispatch({ type: 'clearDone' })
    push(`Удалено: ${removed.length} ${plural(removed.length, 'задача', 'задачи', 'задач')}`, {
      action: { label: 'Отменить', run: () => dispatch({ type: 'restore', tasks: removed }) },
    })
  }, [tasks, dispatch, push])

  const warn = useCallback((m: string) => push(m, { tone: 'error' }), [push])
  const focusInput = useCallback(() => {
    setFilter('all')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="atmosphere" aria-hidden="true" />
      <Sidebar filter={filter} onFilter={setFilter} stats={stats} />

      <div className="relative z-10 lg:pl-[280px]">
        {/* мобильная шапка */}
        <div className="flex items-center justify-between px-5 pt-5 sm:px-8 lg:hidden">
          <Logo />
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <span className="text-lime">{stats.done}</span>/{stats.total}
          </span>
        </div>

        <main className="mx-auto w-full max-w-[920px] px-5 pb-40 sm:px-8 lg:px-14 lg:pb-24">
          <Hero date={date} stats={stats} />
          {saveError && (
            <div
              role="alert"
              className="mt-8 flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-[14px] text-danger"
            >
              <TriangleAlert size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>Не удаётся сохранить данные в браузере. Задачи работают, но пропадут после перезагрузки.</p>
            </div>
          )}
          <Composer onAdd={add} inputRef={inputRef} />
          <ProgressCard stats={stats} compact className="mt-8 lg:hidden" />
          <TaskList
            tasks={tasks}
            visible={visible}
            filter={filter}
            stats={stats}
            onToggle={toggle}
            onRemove={remove}
            onEdit={edit}
            onClearDone={clearDone}
            onInvalid={warn}
            onStart={focusInput}
          />
        </main>
      </div>

      {/* мобильная навигация */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 px-3 pt-2 pb-2 backdrop-blur lg:hidden">
        <FilterNav value={filter} onChange={setFilter} stats={stats} variant="bottom" />
      </div>

      <Toasts toasts={toasts} onDismiss={dismiss} />
    </MotionConfig>
  )
}
