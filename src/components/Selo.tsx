import { BadgeCheck, FlaskConical } from 'lucide-react'

interface SeloProps {
  escuro?: boolean
  real?: boolean
}

/** Identifica a natureza dos dados da tela: fictícios (demonstração) ou reais agregados. */
export function Selo({ escuro = false, real = false }: SeloProps) {
  const Icone = real ? BadgeCheck : FlaskConical
  const cor = escuro
    ? 'border-white/25 text-white/85'
    : real
      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
      : 'border-slate-300 bg-white text-slate-600'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cor}`}>
      <Icone size={13} aria-hidden="true" />
      {real ? 'Resultados reais agregados' : 'Dados fictícios'}
    </span>
  )
}
