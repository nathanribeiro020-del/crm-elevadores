import type { ReactNode } from 'react'

export function Campo({ rotulo, children, className = '' }: { rotulo: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="rotulo">{rotulo}</span>
      {children}
    </label>
  )
}
