import type { ReactNode } from 'react'

interface CabecalhoProps {
  titulo: string
  descricao?: string
  children?: ReactNode
}

export function Cabecalho({ titulo, descricao, children }: CabecalhoProps) {
  return (
    <header className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl text-slate-900">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-slate-500">{descricao}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2 print:hidden">{children}</div>}
    </header>
  )
}
