import { motion } from 'motion/react'
import { CheckCheck, Layers, Loader } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Filter, Stats } from '../lib/tasks'

interface Item {
  id: Filter
  label: string
  Icon: ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>
  count: (s: Stats) => number
}

export const FILTER_ITEMS: Item[] = [
  { id: 'all', label: 'Все задачи', Icon: Layers, count: (s) => s.total },
  { id: 'active', label: 'В процессе', Icon: Loader, count: (s) => s.active },
  { id: 'done', label: 'Выполнено', Icon: CheckCheck, count: (s) => s.done },
]

interface Props {
  value: Filter
  onChange: (f: Filter) => void
  stats: Stats
  variant: 'side' | 'bottom'
}

export function FilterNav({ value, onChange, stats, variant }: Props) {
  const side = variant === 'side'
  return (
    <nav aria-label="Разделы" className={side ? '' : 'w-full'}>
      <ul className={side ? 'flex flex-col gap-1' : 'grid grid-cols-3 gap-1'}>
        {FILTER_ITEMS.map(({ id, label, Icon, count }) => {
          const active = value === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'group relative flex w-full items-center rounded-lg text-left outline-offset-2 transition-colors',
                  side ? 'h-11 gap-3 px-3' : 'h-14 flex-col justify-center gap-0.5 px-1',
                  active ? 'text-fg' : 'text-muted hover:text-fg',
                ].join(' ')}
              >
                {active && (
                  <motion.span
                    layoutId={`filter-pill-${variant}`}
                    className="absolute inset-0 rounded-lg border border-line-strong bg-raised"
                    transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                  >
                    {side && <span className="absolute -left-px top-2.5 bottom-2.5 w-[3px] rounded-full bg-lime" />}
                    {!side && <span className="absolute left-1/2 top-0 h-[2px] w-8 -translate-x-1/2 rounded-full bg-lime" />}
                  </motion.span>
                )}
                <span className={`relative z-10 flex items-center ${side ? 'gap-3' : 'flex-col gap-0.5'}`}>
                  <Icon size={side ? 17 : 18} strokeWidth={1.75} aria-hidden />
                  <span className={side ? 'text-[14px] font-medium' : 'text-[11px] font-medium'}>{label}</span>
                </span>
                <span
                  className={[
                    'z-10 font-mono text-[11px] tabular-nums',
                    side ? 'relative ml-auto' : 'absolute left-[calc(50%+12px)] top-1.5',
                    active ? 'text-lime' : 'text-faint',
                  ].join(' ')}
                  aria-label={`${count(stats)}`}
                >
                  {count(stats)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
