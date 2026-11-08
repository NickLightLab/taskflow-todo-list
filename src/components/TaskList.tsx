import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Trash2 } from 'lucide-react'
import { plural, type Filter, type Stats, type Task } from '../lib/tasks'
import { EmptyState, type EmptyKind } from './EmptyState'
import { TaskItem } from './TaskItem'

interface Props {
  tasks: Task[]
  visible: Task[]
  filter: Filter
  stats: Stats
  onToggle: (id: string) => void
  onRemove: (task: Task) => void
  onEdit: (id: string, text: string) => void
  onClearDone: () => void
  onInvalid: (message: string) => void
  onStart: () => void
}

const TITLES: Record<Filter, string> = { all: 'Все задачи', active: 'В процессе', done: 'Выполнено' }

export function TaskList({ tasks, visible, filter, stats, onToggle, onRemove, onEdit, onClearDone, onInvalid, onStart }: Props) {
  const [confirming, setConfirming] = useState(false)
  // Лесенка появления — только при первой отрисовке, затем задачи появляются без задержки.
  const [stagger, setStagger] = useState(true)

  // То же при смене раздела: новый список выезжает лесенкой.
  useEffect(() => {
    setStagger(true)
    const id = window.setTimeout(() => setStagger(false), 900)
    return () => window.clearTimeout(id)
  }, [filter])

  useEffect(() => {
    if (stats.done === 0) setConfirming(false)
  }, [stats.done])

  useEffect(() => {
    if (!confirming) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setConfirming(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirming])

  const emptyKind: EmptyKind | null =
    tasks.length === 0 ? 'none' : visible.length === 0 ? (filter === 'done' ? 'no-done' : 'no-active') : null

  return (
    <section className="mt-12 sm:mt-16" aria-labelledby="list-title">
      <div className="mb-4 flex min-h-11 items-end justify-between gap-4 px-1 sm:px-3">
        <div>
          <h2 id="list-title" className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <motion.span
              key={filter}
              className="inline-block"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {TITLES[filter]}
            </motion.span>
          </h2>
          <p className="mt-1.5 text-[15px] text-fg" aria-live="polite">
            {stats.total === 0 ? (
              <span className="text-faint">Нет задач</span>
            ) : (
              <>
                <span className="text-muted">{plural(stats.active, 'Осталась', 'Осталось', 'Осталось')}</span>{' '}
                <span className="tabular-nums text-lime">{stats.active}</span>{' '}
                <span className="text-muted">{plural(stats.active, 'задача', 'задачи', 'задач')}</span>
              </>
            )}
          </p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {stats.done > 0 &&
            (confirming ? (
              <motion.div
                key="confirm"
                role="group"
                aria-label="Подтверждение очистки"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5"
              >
                <span className="mr-1 hidden text-[13px] text-muted sm:inline">
                  Удалить {stats.done} {plural(stats.done, 'задачу', 'задачи', 'задач')}?
                </span>
                <button
                  type="button"
                  autoFocus
                  onClick={() => {
                    setConfirming(false)
                    onClearDone()
                  }}
                  className="h-10 rounded-lg bg-danger/15 px-4 text-[13px] font-semibold text-danger transition-colors hover:bg-danger/25 active:scale-95"
                >
                  Удалить
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="h-10 rounded-lg px-3 text-[13px] text-muted transition-colors hover:bg-raised hover:text-fg active:scale-95"
                >
                  Отмена
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="clear"
                type="button"
                onClick={() => setConfirming(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex h-10 items-center gap-2 rounded-lg border border-line px-3.5 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-fg active:scale-95"
              >
                <Trash2 size={14} aria-hidden="true" />
                Очистить выполненные
                <span className="font-mono text-[11px] text-faint">{stats.done}</span>
              </motion.button>
            ))}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait" initial={false}>
      <motion.ul
        key={filter}
        className="relative list-none p-0"
        exit={{ opacity: 0, y: -8, transition: { duration: 0.14, ease: 'easeIn' } }}
      >
        <AnimatePresence mode="popLayout">
          {visible.map((task, i) => (
            <TaskItem
              key={task.id}
              task={task}
              delay={stagger ? Math.min(i, 8) * 0.045 : 0}
              fresh={!stagger && Date.now() - task.createdAt < 1500}
              onToggle={onToggle}
              onRemove={onRemove}
              onEdit={onEdit}
              onInvalid={onInvalid}
            />
          ))}
        </AnimatePresence>
      </motion.ul>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {emptyKind && <EmptyState key={emptyKind} kind={emptyKind} onStart={onStart} />}
      </AnimatePresence>
    </section>
  )
}
