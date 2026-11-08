import type { ReactNode } from 'react'
import { ROTULO_STATUS } from '../lib/rotulos'
import type { StatusContrato } from '../types'

export type TomPilula = 'verde' | 'amarelo' | 'vermelho' | 'cinza' | 'marca' | 'roxo' | 'azul' | 'rosa'

const TONS: Record<TomPilula, string> = {
  verde: 'bg-emerald-100 text-emerald-900',
  amarelo: 'bg-amber-100 text-amber-900',
  vermelho: 'bg-red-100 text-red-900',
  cinza: 'bg-slate-200 text-slate-700',
  marca: 'bg-marca-100 text-marca-900',
  roxo: 'bg-violet-100 text-violet-900',
  azul: 'bg-sky-100 text-sky-900',
  rosa: 'bg-pink-100 text-pink-900',
}

export function Pilula({ tom, children }: { tom: TomPilula; children: ReactNode }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${TONS[tom]}`}>{children}</span>
}

const TOM_STATUS: Record<StatusContrato, TomPilula> = {
  ativo: 'verde',
  vencendo: 'amarelo',
  vencido: 'vermelho',
  perdido: 'cinza',
}

export function PilulaStatus({ status }: { status: StatusContrato }) {
  return <Pilula tom={TOM_STATUS[status]}>{ROTULO_STATUS[status]}</Pilula>
}
