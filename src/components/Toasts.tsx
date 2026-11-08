import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, X } from 'lucide-react'
import type { Toast } from '../hooks/useToasts'

export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4 lg:bottom-8 lg:left-[280px]"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 36 }}
            className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-line-strong bg-raised/95 py-2.5 pl-4 pr-2 text-[14px] shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)] backdrop-blur"
          >
            {t.tone === 'error' ? (
              <AlertTriangle size={16} className="shrink-0 text-danger" aria-hidden="true" />
            ) : (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
            )}
            <span className="min-w-0 flex-1 leading-snug">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.run()
                  onDismiss(t.id)
                }}
                className="shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-lime transition-colors hover:bg-lime/10 active:scale-95"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Закрыть уведомление"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-bg hover:text-fg"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
