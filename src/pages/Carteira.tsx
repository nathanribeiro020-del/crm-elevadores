import { ArrowDown, ArrowUp, Plus, Search, Upload } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Cabecalho } from '../components/Cabecalho'
import { Campo } from '../components/Campo'
import { DetalheContrato } from '../components/DetalheContrato'
import { EstadoVazio } from '../components/EstadoVazio'
import { FormNovoContrato } from '../components/FormNovoContrato'
import { FormOportunidade } from '../components/FormOportunidade'
import { ImportarCsv } from '../components/ImportarCsv'
import { PilulaStatus } from '../components/Pilula'
import { useEstado } from '../data/contexto'
import { data, diasEntre, moeda } from '../lib/format'
import { useRota } from '../lib/rota'
import { ROTULO_STATUS, ROTULO_TIPO_CONTRATO } from '../lib/rotulos'
import type { Cliente, Contrato, StatusContrato } from '../types'

interface Linha {
  contrato: Contrato
  cliente: Cliente
  dias: number
}

type CampoOrdem = 'nome' | 'cidade' | 'qtd' | 'marca' | 'tipo' | 'valor' | 'vencimento' | 'status'

const COLUNAS: { campo: CampoOrdem; nome: string; direita?: boolean }[] = [
  { campo: 'nome', nome: 'Condomínio' },
  { campo: 'cidade', nome: 'Cidade/Bairro' },
  { campo: 'qtd', nome: 'Elev.', direita: true },
  { campo: 'marca', nome: 'Marca' },
  { campo: 'tipo', nome: 'Tipo' },
  { campo: 'valor', nome: 'Valor mensal', direita: true },
  { campo: 'vencimento', nome: 'Vencimento' },
]

const ORDEM_STATUS: Record<StatusContrato, number> = { vencendo: 0, vencido: 1, ativo: 2, perdido: 3 }

function valorOrdem(l: Linha, campo: CampoOrdem): string | number {
  switch (campo) {
    case 'nome': return l.cliente.nome
    case 'cidade': return l.cliente.cidade
    case 'qtd': return l.contrato.qtdElevadores
    case 'marca': return l.contrato.marca
    case 'tipo': return l.contrato.tipo
    case 'valor': return l.contrato.valorMensal
    case 'vencimento': return l.contrato.vencimento
    case 'status': return ORDEM_STATUS[l.contrato.status]
  }
}

const textoDias = (dias: number) => (dias >= 0 ? `${dias} dias` : `há ${-dias} dias`)

export default function Carteira() {
  const { estado, hoje } = useEstado()
  const { parametros } = useRota()
  const statusUrl = parametros.get('status') ?? ''

  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState(statusUrl)
  const [cidade, setCidade] = useState('')
  const [marca, setMarca] = useState('')
  const [tipo, setTipo] = useState('')
  const [ordem, setOrdem] = useState<{ campo: CampoOrdem; asc: boolean }>({ campo: 'vencimento', asc: true })
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [novoContrato, setNovoContrato] = useState(false)
  const [importando, setImportando] = useState(false)
  const [oportunidadePara, setOportunidadePara] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')

  const [statusUrlAnterior, setStatusUrlAnterior] = useState(statusUrl)
  if (statusUrl !== statusUrlAnterior) {
    setStatusUrlAnterior(statusUrl)
    setStatus(statusUrl)
  }

  useEffect(() => {
    if (!aviso) return
    const t = window.setTimeout(() => setAviso(''), 3500)
    return () => window.clearTimeout(t)
  }, [aviso])

  const linhas = useMemo<Linha[]>(() => {
    const clientes = new Map(estado.clientes.map((c) => [c.id, c]))
    return estado.contratos.flatMap((contrato) => {
      const cliente = clientes.get(contrato.clienteId)
      return cliente ? [{ contrato, cliente, dias: diasEntre(hoje, contrato.vencimento) }] : []
    })
  }, [estado.clientes, estado.contratos, hoje])

  const cidades = useMemo(() => [...new Set(linhas.map((l) => l.cliente.cidade))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [linhas])
  const marcas = useMemo(() => [...new Set(linhas.map((l) => l.contrato.marca))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [linhas])

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return linhas
      .filter(({ contrato, cliente }) => {
        if (status && contrato.status !== status) return false
        if (cidade && cliente.cidade !== cidade) return false
        if (marca && contrato.marca !== marca) return false
        if (tipo && contrato.tipo !== tipo) return false
        if (termo && !`${cliente.nome} ${cliente.bairro} ${cliente.cidade} ${cliente.sindico}`.toLowerCase().includes(termo)) return false
        return true
      })
      .sort((a, b) => {
        const va = valorOrdem(a, ordem.campo)
        const vb = valorOrdem(b, ordem.campo)
        const r = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'pt-BR')
        return ordem.asc ? r : -r
      })
  }, [linhas, busca, status, cidade, marca, tipo, ordem])

  const aberta = linhas.find((l) => l.contrato.id === selecionado)
  const temFiltro = Boolean(busca || status || cidade || marca || tipo)

  function limpar() {
    setBusca('')
    setStatus('')
    setCidade('')
    setMarca('')
    setTipo('')
  }

  function ordenar(campo: CampoOrdem) {
    setOrdem((o) => (o.campo === campo ? { campo, asc: !o.asc } : { campo, asc: true }))
  }

  function cabeca({ campo, nome, direita }: { campo: CampoOrdem; nome: string; direita?: boolean }) {
    const ativa = ordem.campo === campo
    const Seta = ordem.asc ? ArrowUp : ArrowDown
    return (
      <th key={campo} aria-sort={ativa ? (ordem.asc ? 'ascending' : 'descending') : 'none'} className={`px-3 py-1 font-semibold ${direita ? 'text-right' : 'text-left'}`}>
        <button type="button" onClick={() => ordenar(campo)} className={`inline-flex min-h-9 items-center gap-1 whitespace-nowrap ${ativa ? 'text-marca-800' : ''}`}>
          {nome}
          {ativa && <Seta size={13} aria-hidden="true" />}
        </button>
      </th>
    )
  }

  return (
    <>
      <Cabecalho titulo="Carteira" descricao={`${filtradas.length} de ${linhas.length} contratos`}>
        <button type="button" className="btn btn-secundario" onClick={() => setImportando(true)}>
          <Upload size={16} aria-hidden="true" />
          Importar CSV
        </button>
        <button type="button" className="btn btn-primario" onClick={() => setNovoContrato(true)}>
          <Plus size={16} aria-hidden="true" />
          Novo contrato
        </button>
      </Cabecalho>

      <div className="cartao mb-3 grid grid-cols-2 gap-3 p-3 lg:grid-cols-6">
        <Campo rotulo="Buscar" className="col-span-2">
          <div className="relative">
            <Search size={16} aria-hidden="true" className="absolute left-3 top-3.5 text-slate-400" />
            <input className="campo pl-9!" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Condomínio, bairro ou síndico" />
          </div>
        </Campo>
        <Campo rotulo="Status">
          <select className="campo" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(ROTULO_STATUS).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Cidade">
          <select className="campo" value={cidade} onChange={(e) => setCidade(e.target.value)}>
            <option value="">Todas</option>
            {cidades.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Marca">
          <select className="campo" value={marca} onChange={(e) => setMarca(e.target.value)}>
            <option value="">Todas</option>
            {marcas.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Tipo de contrato">
          <select className="campo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(ROTULO_TIPO_CONTRATO).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </Campo>
      </div>

      {filtradas.length === 0 ? (
        <div className="cartao">
          <EstadoVazio titulo="Nenhum contrato encontrado" texto="Ajuste a busca ou os filtros para ver mais resultados.">
            {temFiltro && <button type="button" className="btn btn-secundario" onClick={limpar}>Limpar filtros</button>}
          </EstadoVazio>
        </div>
      ) : (
        <>
          <div className="cartao hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  {COLUNAS.map(cabeca)}
                  <th className="px-3 py-1 text-right font-semibold">Dias p/ vencer</th>
                  {cabeca({ campo: 'status', nome: 'Status' })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtradas.map(({ contrato: c, cliente, dias }) => (
                  <tr
                    key={c.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Abrir detalhes de ${cliente.nome}`}
                    onClick={() => setSelecionado(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelecionado(c.id)
                      }
                    }}
                    className="cursor-pointer hover:bg-marca-50"
                  >
                    <td className="px-3 py-2.5 font-medium text-slate-900">{cliente.nome}</td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {cliente.cidade}
                      <span className="block text-xs text-slate-500">{cliente.bairro}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">{c.qtdElevadores}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{c.marca}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{ROTULO_TIPO_CONTRATO[c.tipo]}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">{moeda(c.valorMensal)}</td>
                    <td className="px-3 py-2.5 text-slate-600">{data(c.vencimento)}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-600">{textoDias(dias)}</td>
                    <td className="px-3 py-2.5"><PilulaStatus status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-2 lg:hidden">
            {filtradas.map(({ contrato: c, cliente, dias }) => (
              <li key={c.id}>
                <button type="button" onClick={() => setSelecionado(c.id)} className="cartao block w-full p-4 text-left">
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0 font-medium text-slate-900">{cliente.nome}</span>
                    <PilulaStatus status={c.status} />
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">{cliente.bairro}, {cliente.cidade}</span>
                  <span className="mt-2 flex items-end justify-between gap-2 text-sm">
                    <span className="text-slate-600">
                      {c.qtdElevadores} elev. · {c.marca}
                      <span className="block text-xs text-slate-500">{ROTULO_TIPO_CONTRATO[c.tipo]}</span>
                    </span>
                    <span className="text-right">
                      <span className="font-semibold text-slate-900">{moeda(c.valorMensal)}</span>
                      <span className="block text-xs text-slate-500">{data(c.vencimento)} ({textoDias(dias)})</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {aviso && (
        <div role="status" className="surgir fixed inset-x-4 bottom-24 z-50 rounded-lg bg-slate-900 px-4 py-3 text-center text-sm text-white md:inset-x-auto md:bottom-6 md:right-6">
          {aviso}
        </div>
      )}

      {aberta && (
        <DetalheContrato
          contrato={aberta.contrato}
          cliente={aberta.cliente}
          aoFechar={() => setSelecionado(null)}
          aoCriarOportunidade={() => {
            setOportunidadePara(aberta.cliente.id)
            setSelecionado(null)
          }}
        />
      )}
      {novoContrato && <FormNovoContrato aoFechar={() => setNovoContrato(false)} />}
      {importando && <ImportarCsv aoFechar={() => setImportando(false)} aoConcluir={setAviso} />}
      {oportunidadePara && (
        <FormOportunidade clienteId={oportunidadePara} aoFechar={() => setOportunidadePara(null)} aoSalvar={() => setAviso('Oportunidade criada no Funil.')} />
      )}
    </>
  )
}
