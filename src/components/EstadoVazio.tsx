import type { ReactNode } from 'react'

export function EstadoVazio({ titulo, texto, children }: { titulo: string; texto?: string; children?: ReactNode }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="font-medium text-slate-700">{titulo}</p>
      {texto && <p className="mt-1 text-sm text-slate-500">{texto}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}
