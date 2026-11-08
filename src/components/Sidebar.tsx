import type { Filter, Stats } from '../lib/tasks'
import { FilterNav } from './FilterNav'
import { Logo } from './Logo'
import { ProgressCard } from './Progress'

interface Props {
  filter: Filter
  onFilter: (f: Filter) => void
  stats: Stats
}

export function Sidebar({ filter, onFilter, stats }: Props) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[280px] flex-col border-r border-line bg-bg/70 px-5 py-6 backdrop-blur-sm lg:flex">
      <Logo />
      <div className="mt-9 border-t border-line pt-5">
        <p className="px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Пространство</p>
        <p className="mt-1 px-3 text-[15px] font-medium">Личный фокус</p>
      </div>
      <div className="mt-6">
        <FilterNav value={filter} onChange={onFilter} stats={stats} variant="side" />
      </div>
      <ProgressCard stats={stats} className="mt-auto" />
    </aside>
  )
}
