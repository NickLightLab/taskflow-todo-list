export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <rect x="0.75" y="0.75" width="32.5" height="32.5" rx="9" stroke="var(--color-line-strong)" strokeWidth="1.5" />
        <path d="M11 9.5h13v4.2H15.4v3.4H22v4.2h-6.6V25H11z" fill="var(--color-lime)" />
      </svg>
      <div className="leading-none">
        <div className="text-[15px] font-semibold tracking-[0.28em]">FORMA</div>
        <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Your space to focus</div>
      </div>
    </div>
  )
}
