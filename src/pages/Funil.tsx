import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Cabecalho } from '../components/Cabecalho'
import { CardArrastado, CardOportunidade } from '../components/CardOportunidade'
import { Campo } from '../components/Campo'
import { FormOportunidade } from '../components/FormOportunidade'
import { Modal } from '../components/Modal'
import { useEstado } from '../data/contexto'
import { moedaSemCentavos, porcentagem } from '../lib/format'
import { calcularIndicadores, valorOportunidade } from '../lib/kpis'
import { ETAPAS, MOTIVOS_PERDA } from '../lib/rotulos'
import type { EtapaFunil, Oportunidade } from '../types'

interface ColunaProps {
  etapa: EtapaFunil
  nome: string
  itens: Oportunidade[]
  children: ReactNode
}

function Coluna({ etapa, nome, itens, children }: ColunaProps) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa })
  const total = itens.reduce((soma, o) => soma + valorOportunidade(o), 0)
  return (
    <section aria-label={nome} className="flex w-[84vw] max-w-[320px] shrink-0 snap-center flex-col md:w-64 md:snap-align-none">
      <header className="mb-2 px-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm text-slate-900">{nome}</h2>
          <span className="rounded-full bg-slate-200 px-2 text-xs font-semibold text-slate-700">{itens.length}</span>
        </div>
        <p className="text-xs text-slate-500">{moedaSemCentavos(total)}</p>
      </header>
      <div ref={setNodeRef} className={`flex min-h-40 flex-1 flex-col gap-2 rounded-xl p-2 transition-colors ${isOver ? 'bg-marca-100 ring-2 ring-marca-400' : 'bg-slate-200/60'}`}>
        {children}
        {itens.length === 0 && <p className="px-2 py-6 text-center text-xs text-slate-500">Arraste uma oportunidade para cá</p>}
      </div>
    </section>
  )
}

export default function Funil() {
  const { estado, atualizar, hoje } = useEstado()
  const [arrastando, setArrastando] = useState<string | null>(null)
  const [movendo, setMovendo] = useState<Oportunidade | null>(null)
  const [perdaDe, setPerdaDe] = useState<string | null>(null)
  const [motivo, setMotivo] = useState(MOTIVOS_PERDA[0])
  const [nova, setNova] = useState(false)

  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 10 } }),
    useSensor(KeyboardSensor),
  )

  const nomes = useMemo(() => new Map(estado.clientes.map((c) => [c.id, c.nome])), [estado.clientes])
  const kpi = useMemo(() => calcularIndicadores(estado, hoje), [estado, hoje])
  const nomeDe = (o: Oportunidade) => nomes.get(o.clienteId) ?? 'Cliente removido'

  const ganhas = estado.oportunidades.filter((o) => o.etapa === 'ganho').length
  const perdidas = estado.oportunidades.filter((o) => o.etapa === 'perdido').length
  const conversao = ganhas + perdidas > 0 ? (ganhas / (ganhas + perdidas)) * 100 : 0

  function aplicar(id: string, etapa: EtapaFunil, motivoPerda?: string) {
    atualizar((e) => ({
      ...e,
      oportunidades: e.oportunidades.map((o) =>
        o.id === id
          ? {
              ...o,
              etapa,
              motivoPerda: etapa === 'perdido' ? motivoPerda : undefined,
              orcamentoEnviadoEm: etapa === 'proposta' ? (o.orcamentoEnviadoEm ?? hoje) : o.orcamentoEnviadoEm,
            }
          : o,
      ),
    }))
  }

  function mover(id: string, etapa: EtapaFunil) {
    const atual = estado.oportunidades.find((o) => o.id === id)
    if (!atual || atual.etapa === etapa) return
    if (etapa === 'perdido') {
      setMotivo(MOTIVOS_PERDA[0])
      setPerdaDe(id)
    } else {
      aplicar(id, etapa)
    }
  }

  function aoSoltar({ active, over }: DragEndEvent) {
    setArrastando(null)
    if (over) mover(String(active.id), over.id as EtapaFunil)
  }

  const emArraste = estado.oportunidades.find((o) => o.id === arrastando)

  return (
    <>
      <Cabecalho titulo="Funil" descricao={`Pipeline aberto: ${moedaSemCentavos(kpi.pipeline)} · Taxa de conversão: ${porcentagem(conversao)} (ganhas ÷ encerradas)`}>
        <button type="button" className="btn btn-primario" onClick={() => setNova(true)}>
          <Plus size={16} aria-hidden="true" />
          Nova oportunidade
        </button>
      </Cabecalho>

      <DndContext
        sensors={sensores}
        onDragStart={({ active }: DragStartEvent) => setArrastando(String(active.id))}
        onDragEnd={aoSoltar}
        onDragCancel={() => setArrastando(null)}
      >
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:snap-none md:px-0">
          {ETAPAS.map(({ id, nome }) => {
            const itens = estado.oportunidades.filter((o) => o.etapa === id)
            return (
              <Coluna key={id} etapa={id} nome={nome} itens={itens}>
                {itens.map((o) => (
                  <CardOportunidade key={o.id} oportunidade={o} condominio={nomeDe(o)} hoje={hoje} aoMover={() => setMovendo(o)} />
                ))}
              </Coluna>
            )
          })}
        </div>
        <DragOverlay dropAnimation={null}>
          {emArraste ? <CardArrastado oportunidade={emArraste} condominio={nomeDe(emArraste)} hoje={hoje} /> : null}
        </DragOverlay>
      </DndContext>

      {movendo && (
        <Modal titulo={`Mover: ${movendo.titulo}`} aoFechar={() => setMovendo(null)}>
          <div className="flex flex-col gap-1">
            {ETAPAS.map(({ id, nome }) => (
              <button
                key={id}
                type="button"
                disabled={id === movendo.etapa}
                onClick={() => {
                  mover(movendo.id, id)
                  setMovendo(null)
                }}
                className="flex min-h-12 items-center justify-between rounded-lg px-3 text-left font-medium text-slate-700 hover:bg-slate-100 disabled:bg-marca-50 disabled:text-marca-800"
              >
                {nome}
                {id === movendo.etapa && <span className="text-xs font-normal">Etapa atual</span>}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {perdaDe && (
        <Modal titulo="Motivo da perda" aoFechar={() => setPerdaDe(null)}>
          <div className="flex flex-col gap-4">
            <Campo rotulo="Por que esta oportunidade foi perdida?">
              <select className="campo" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                {MOTIVOS_PERDA.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Campo>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-secundario" onClick={() => setPerdaDe(null)}>Cancelar</button>
              <button
                type="button"
                className="btn btn-primario"
                onClick={() => {
                  aplicar(perdaDe, 'perdido', motivo)
                  setPerdaDe(null)
                }}
              >
                Confirmar perda
              </button>
            </div>
          </div>
        </Modal>
      )}

      {nova && <FormOportunidade aoFechar={() => setNova(false)} />}
    </>
  )
}
