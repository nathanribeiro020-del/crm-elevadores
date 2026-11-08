import { AlertTriangle, type LucideIcon } from 'lucide-react'

interface KpiTileProps {
  rotulo: string
  valor: string
  detalhe?: string
  icone?: LucideIcon
  alerta?: boolean
}

export function KpiTile({ rotulo, valor, detalhe, icone: Icone, alerta = false }: KpiTileProps) {
  const IconeFinal = alerta ? AlertTriangle : Icone
  return (
    <div className={`cartao min-w-0 p-4 ${alerta ? 'border-amber-300! bg-amber-50!' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-xs font-medium leading-snug ${alerta ? 'text-amber-900' : 'text-slate-500'}`}>{rotulo}</p>
        {IconeFinal && <IconeFinal size={16} aria-hidden="true" className={`shrink-0 ${alerta ? 'text-amber-700' : 'text-marca-500'}`} />}
      </div>
      <p className="mt-2 text-2xl font-semibold leading-tight text-slate-900">{valor}</p>
      {detalhe && <p className={`mt-1 text-xs ${alerta ? 'text-amber-900' : 'text-slate-500'}`}>{detalhe}</p>}
    </div>
  )
}
