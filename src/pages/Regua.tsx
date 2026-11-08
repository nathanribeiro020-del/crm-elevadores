import { Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Cabecalho } from '../components/Cabecalho'
import { Campo } from '../components/Campo'
import { EditorPasso } from '../components/EditorPasso'
import { EstadoVazio } from '../components/EstadoVazio'
import { FilaEnvios, descreverPasso } from '../components/FilaEnvios'
import { Modal } from '../components/Modal'
import { PreviaWhatsApp } from '../components/PreviaWhatsApp'
import { useEstado } from '../data/contexto'
import { novoId } from '../lib/format'
import { proximosVencimentos, type ItemFila } from '../lib/kpis'
import { useRota } from '../lib/rota'
import { preencherMensagem } from '../lib/template'
import type { PassoRegua, Segmento } from '../types'

export default function Regua() {
  const { estado, atualizar } = useEstado()
  const { parametros } = useRota()
  const clienteUrl = parametros.get('cliente')

  const clientesOrdenados = useMemo(() => {
    const prioridade = proximosVencimentos(estado.contratos, estado.contratos.length).map((c) => c.clienteId)
    const posicao = new Map(prioridade.map((id, i) => [id, i]))
    return [...estado.clientes].sort((a, b) => (posicao.get(a.id) ?? 9999) - (posicao.get(b.id) ?? 9999))
  }, [estado.clientes, estado.contratos])

  const [segmentoId, setSegmentoId] = useState(estado.segmentos[0]?.id ?? '')
  const [clienteId, setClienteId] = useState(clienteUrl ?? clientesOrdenados[0]?.id ?? '')
  const [passoId, setPassoId] = useState<string | null>(null)
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [periodicidade, setPeriodicidade] = useState('12')
  const blocoPrevia = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (clienteUrl) setClienteId(clienteUrl)
  }, [clienteUrl])

  const segmento = estado.segmentos.find((s) => s.id === segmentoId) ?? estado.segmentos[0]
  const passos = segmento?.passos ?? []
  const passoPrevia = passos.find((p) => p.id === passoId) ?? passos[0]
  const cliente = estado.clientes.find((c) => c.id === clienteId)
  const contrato = estado.contratos.find((c) => c.clienteId === clienteId)

  const textoPrevia =
    passoPrevia && cliente ? preencherMensagem(passoPrevia.mensagem, { cliente, contrato, empresa: estado.config.empresa }) : null

  function mudarSegmento(mudanca: (s: Segmento) => Segmento) {
    if (!segmento) return
    atualizar((e) => ({ ...e, segmentos: e.segmentos.map((s) => (s.id === segmento.id ? mudanca(s) : s)) }))
  }

  const mudarPasso = (id: string, mudanca: Partial<PassoRegua>) =>
    mudarSegmento((s) => ({ ...s, passos: s.passos.map((p) => (p.id === id ? { ...p, ...mudanca } : p)) }))

  const excluirPasso = (id: string) => mudarSegmento((s) => ({ ...s, passos: s.passos.filter((p) => p.id !== id) }))

  function adicionarPasso() {
    const novo: PassoRegua = {
      id: novoId('passo'),
      gatilho: 'dias_antes_vencimento',
      dias: 15,
      ativo: true,
      mensagem: 'Olá, {sindico}! Aqui é da {empresa}. ',
    }
    mudarSegmento((s) => ({ ...s, passos: [...s.passos, novo] }))
    setPassoId(novo.id)
  }

  function criarSegmento(e: FormEvent) {
    e.preventDefault()
    const novo: Segmento = { id: novoId('seg'), nome: nome.trim(), periodicidadeMeses: Number(periodicidade), passos: [] }
    atualizar((est) => ({ ...est, segmentos: [...est.segmentos, novo] }))
    setSegmentoId(novo.id)
    setPassoId(null)
    setNome('')
    setPeriodicidade('12')
    setCriando(false)
  }

  function verItemDaFila(item: ItemFila) {
    setSegmentoId(item.segmento.id)
    setPassoId(item.passo.id)
    setClienteId(item.cliente.id)
    blocoPrevia.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <>
      <Cabecalho titulo="Régua de WhatsApp" descricao="Mensagens automáticas por segmento, disparadas pelo calendário de cada contrato.">
        <button type="button" className="btn btn-primario" onClick={() => setCriando(true)}>
          <Plus size={16} aria-hidden="true" />
          Novo segmento
        </button>
      </Cabecalho>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        <nav aria-label="Segmentos" className="cartao h-fit p-2 lg:col-span-2 xl:col-span-1">
          <ul className="flex flex-col gap-1">
            {estado.segmentos.map((s) => {
              const ativo = s.id === segmento?.id
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-current={ativo ? 'true' : undefined}
                    onClick={() => {
                      setSegmentoId(s.id)
                      setPassoId(null)
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left ${ativo ? 'bg-marca-50 text-marca-900' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    <span className="block text-sm font-medium">{s.nome}</span>
                    <span className="block text-xs text-slate-500">A cada {s.periodicidadeMeses} meses · {s.passos.length} passos</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div ref={blocoPrevia} className="cartao h-fit p-4 lg:order-3 lg:sticky lg:top-6">
          <h2 className="text-base text-slate-900">Prévia da mensagem</h2>
          <p className="mb-3 mt-0.5 text-xs text-slate-500">{passoPrevia ? descreverPasso(passoPrevia) : 'Sem passo selecionado'}</p>
          <Campo rotulo="Cliente" className="mb-4">
            <select className="campo" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              {clientesOrdenados.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Campo>
          <PreviaWhatsApp empresa={estado.config.empresa} texto={textoPrevia} />
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:order-2">
          {passos.length === 0 && (
            <div className="cartao">
              <EstadoVazio titulo="Este segmento ainda não tem passos" texto="Adicione o primeiro passo para definir quando e o que enviar." />
            </div>
          )}
          {passos.map((p, i) => (
            <EditorPasso
              key={p.id}
              passo={p}
              numero={i + 1}
              emPrevia={p.id === passoPrevia?.id}
              aoMudar={(m) => mudarPasso(p.id, m)}
              aoExcluir={() => excluirPasso(p.id)}
              aoVerPrevia={() => setPassoId(p.id)}
            />
          ))}
          <button type="button" className="btn btn-secundario border-dashed!" onClick={adicionarPasso} disabled={!segmento}>
            <Plus size={16} aria-hidden="true" />
            Adicionar passo
          </button>
        </div>
      </div>

      <FilaEnvios aoVerPrevia={verItemDaFila} />

      {criando && (
        <Modal titulo="Novo segmento" aoFechar={() => setCriando(false)}>
          <form onSubmit={criarSegmento} className="flex flex-col gap-3">
            <Campo rotulo="Nome do segmento">
              <input required className="campo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Modernização, escadas rolantes, construtoras…" />
            </Campo>
            <Campo rotulo="Periodicidade (meses)">
              <input required type="number" min={1} className="campo" value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value)} />
            </Campo>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-secundario" onClick={() => setCriando(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primario">Criar segmento</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
