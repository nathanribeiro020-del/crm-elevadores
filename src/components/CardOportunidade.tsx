import { AlertCircle, ArrowRightLeft } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { data, moeda } from '../lib/format'
import { estaAberta } from '../lib/kpis'
import { ROTULO_ORIGEM } from '../lib/rotulos'
import type { Oportunidade, Origem } from '../types'
import { Pilula, type TomPilula } from './Pilula'

const TOM_ORIGEM: Record<Origem, TomPilula> = {
  novo: 'azul',
  renovacao: 'marca',
  modernizacao: 'roxo',
  licitacao: 'rosa',
  indicacao: 'cinza',
}

function valorDoCard(o: Oportunidade) {
  if (o.valorMensal) return `${moeda(o.valorMensal)}/mês`
  if (o.valorUnico) return `${moeda(o.valorUnico)} único`
  return 'Sem valor'
}

interface ConteudoProps {
  oportunidade: Oportunidade
  condominio: string
  hoje: string
}

function Conteudo({ oportunidade: o, condominio, hoje }: ConteudoProps) {
  const atrasada = estaAberta(o) && o.dataProximaAcao < hoje
  return (
    <>
      <p className="font-medium leading-snug text-slate-900">{condominio}</p>
      <p className="mt-0.5 text-sm text-slate-600">{o.titulo}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">{valorDoCard(o)}</span>
        <Pilula tom={TOM_ORIGEM[o.origem]}>{ROTULO_ORIGEM[o.origem]}</Pilula>
      </div>
      {o.motivoPerda && <p className="mt-2 text-xs text-slate-600">Motivo: {o.motivoPerda}</p>}
      <p className="mt-2 text-xs text-slate-600">{o.proximaAcao}</p>
      <p className={`mt-0.5 flex items-center gap-1 text-xs ${atrasada ? 'font-semibold text-red-700' : 'text-slate-500'}`}>
        {atrasada && <AlertCircle size={12} aria-hidden="true" />}
        {data(o.dataProximaAcao)}
        {atrasada && ' (atrasada)'}
      </p>
    </>
  )
}

export function CardArrastado(props: ConteudoProps) {
  return (
    <div className="cartao rotate-1 cursor-grabbing p-3 shadow-xl">
      <Conteudo {...props} />
    </div>
  )
}

export function CardOportunidade({ aoMover, ...props }: ConteudoProps & { aoMover: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: props.oportunidade.id })

  return (
    <article
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ touchAction: 'manipulation' }}
      className={`cartao cursor-grab select-none p-3 ${isDragging ? 'opacity-40' : ''}`}
    >
      <Conteudo {...props} />
      <button type="button" onClick={aoMover} className="mt-2 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
        <ArrowRightLeft size={14} aria-hidden="true" />
        Mover para…
      </button>
    </article>
  )
}
