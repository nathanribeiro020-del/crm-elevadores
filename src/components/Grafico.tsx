import type { ReactElement, ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'

interface CartaoGraficoProps {
  titulo: string
  descricao?: string
  className?: string
  children: ReactNode
}

export function CartaoGrafico({ titulo, descricao, className = '', children }: CartaoGraficoProps) {
  return (
    <section className={`cartao min-w-0 p-4 ${className}`}>
      <h2 className="text-base text-slate-900">{titulo}</h2>
      {descricao && <p className="mt-0.5 text-xs text-slate-500">{descricao}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

/** Altura fixa e dimensão inicial evitam salto de layout e avisos do Recharts ao montar. */
export function AreaGrafico({ altura, descricao, children }: { altura: number; descricao: string; children: ReactElement }) {
  return (
    <div role="img" aria-label={descricao} style={{ height: altura }}>
      <ResponsiveContainer width="100%" height={altura} initialDimension={{ width: 320, height: altura }}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}

interface ItemDica {
  name?: unknown
  value?: unknown
  color?: string
}

interface DicaGraficoProps {
  active?: boolean
  payload?: ReadonlyArray<ItemDica>
  label?: unknown
  formatar?: (valor: number) => string
}

export function DicaGrafico({ active, payload, label, formatar = String }: DicaGraficoProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      {label !== undefined && <p className="mb-1 font-semibold text-slate-800">{String(label)}</p>}
      {payload.map((item) => (
        <p key={String(item.name)} className="flex items-center gap-2 text-slate-600">
          <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: item.color }} />
          {String(item.name)}: <span className="font-semibold text-slate-900">{formatar(Number(item.value))}</span>
        </p>
      ))}
    </div>
  )
}
