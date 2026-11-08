import Papa from 'papaparse'
import { useMemo, useState, type ChangeEvent } from 'react'
import { useEstado } from '../data/contexto'
import { statusPorData } from '../data/storage'
import { data, moeda, novoId, somarMeses } from '../lib/format'
import type { Cliente, Contrato, Origem, TipoContrato } from '../types'
import { Modal } from './Modal'

const COLUNAS = ['condominio', 'cidade', 'bairro', 'qtd_elevadores', 'marca', 'tipo_contrato', 'valor_mensal', 'inicio', 'vencimento', 'origem', 'status']

const MODELO = `condominio,cidade,bairro,qtd_elevadores,marca,tipo_contrato,valor_mensal,inicio,vencimento,origem,status
Residencial Exemplo Um,Goiânia,Setor Bueno,2,Otis,sem_pecas,1800,10/02/2026,10/02/2027,renovacao,ativo
Edifício Exemplo Dois,Anápolis,Centro,1,Orona,com_pecas,1250.50,05/12/2025,05/12/2026,novo,ativo
Centro Empresarial Exemplo Três,Brasília,Asa Sul,4,Villarta,com_pecas,6900,2025-11-20,2026-11-20,indicacao,ativo`

interface LinhaImportada {
  nome: string
  cidade: string
  bairro: string
  qtd: number
  marca: string
  tipo: TipoContrato
  valor: number
  inicio: string
  vencimento: string
  origem: Origem
  perdido: boolean
}

interface Analise {
  validas: LinhaImportada[]
  ignoradas: string[]
  erro?: string
}

const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

function lerData(bruto: string): string | null {
  const t = bruto.trim()
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  if (iso) return t
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t)
  return br ? `${br[3]}-${br[2]}-${br[1]}` : null
}

function lerValor(bruto: string) {
  const t = bruto.replace(/[R$\s]/g, '')
  const numero = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t
  return Number(numero)
}

function lerOrigem(bruto: string): Origem {
  const t = semAcento(bruto)
  const validas: Origem[] = ['novo', 'renovacao', 'modernizacao', 'licitacao', 'indicacao']
  return validas.find((o) => o === t) ?? 'novo'
}

function analisar(texto: string): Analise {
  const r = Papa.parse<Record<string, string>>(texto.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => semAcento(h),
  })
  const faltando = COLUNAS.filter((c) => !r.meta.fields?.includes(c))
  if (faltando.length > 0) return { validas: [], ignoradas: [], erro: `Colunas ausentes: ${faltando.join(', ')}.` }

  const validas: LinhaImportada[] = []
  const ignoradas: string[] = []
  r.data.forEach((l, i) => {
    const linha = i + 2
    const inicio = lerData(l.inicio ?? '')
    const valor = lerValor(l.valor_mensal ?? '')
    const qtd = Number(l.qtd_elevadores)
    if (!l.condominio?.trim()) return void ignoradas.push(`Linha ${linha}: condomínio vazio`)
    if (!inicio) return void ignoradas.push(`Linha ${linha}: data de início inválida`)
    if (!Number.isFinite(valor) || valor <= 0) return void ignoradas.push(`Linha ${linha}: valor mensal inválido`)
    if (!Number.isInteger(qtd) || qtd < 1) return void ignoradas.push(`Linha ${linha}: quantidade de elevadores inválida`)
    validas.push({
      nome: l.condominio.trim(),
      cidade: l.cidade?.trim() || 'Não informada',
      bairro: l.bairro?.trim() || 'Não informado',
      qtd,
      marca: l.marca?.trim() || 'Não informada',
      tipo: semAcento(l.tipo_contrato ?? '').includes('com') ? 'com_pecas' : 'sem_pecas',
      valor,
      inicio,
      vencimento: lerData(l.vencimento ?? '') ?? somarMeses(inicio, 12),
      origem: lerOrigem(l.origem ?? ''),
      perdido: semAcento(l.status ?? '') === 'perdido',
    })
  })
  return { validas, ignoradas }
}

const nomeAnonimo = (n: number) => `Cliente ${String(n).padStart(3, '0')}`

export function ImportarCsv({ aoFechar, aoConcluir }: { aoFechar: () => void; aoConcluir: (mensagem: string) => void }) {
  const { estado, atualizar, hoje } = useEstado()
  const [texto, setTexto] = useState('')
  const [anonimizar, setAnonimizar] = useState(true)
  const [modo, setModo] = useState<'somar' | 'substituir'>('somar')
  const [verModelo, setVerModelo] = useState(false)

  const analise = useMemo(() => (texto.trim() ? analisar(texto) : null), [texto])

  const primeiroNumero = useMemo(() => {
    if (modo === 'substituir') return 1
    const usados = estado.clientes.map((c) => /^Cliente (\d+)$/.exec(c.nome)?.[1]).filter(Boolean).map(Number)
    return (usados.length ? Math.max(...usados) : 0) + 1
  }, [estado.clientes, modo])

  const nomeFinal = (l: LinhaImportada, i: number) => (anonimizar ? nomeAnonimo(primeiroNumero + i) : l.nome)

  async function lerArquivo(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (arquivo) setTexto(await arquivo.text())
  }

  function importar() {
    if (!analise || analise.validas.length === 0) return
    const clientes: Cliente[] = []
    const contratos: Contrato[] = []

    analise.validas.forEach((l, i) => {
      const clienteId = novoId('cli')
      clientes.push({ id: clienteId, nome: nomeFinal(l, i), tipo: 'residencial', cidade: l.cidade, bairro: l.bairro, sindico: '', telefone: '' })
      const base = { status: l.perdido ? ('perdido' as const) : ('ativo' as const), vencimento: l.vencimento }
      contratos.push({
        ...base,
        id: novoId('ctr'),
        clienteId,
        qtdElevadores: l.qtd,
        marca: l.marca,
        anoEquipamento: 0,
        tipo: l.tipo,
        valorMensal: l.valor,
        inicio: l.inicio,
        status: statusPorData(base, hoje),
        origem: l.origem,
        manual: true,
      })
    })

    atualizar((e) =>
      modo === 'substituir'
        ? { ...e, clientes, contratos, oportunidades: [], filaStatus: {} }
        : { ...e, clientes: [...e.clientes, ...clientes], contratos: [...e.contratos, ...contratos] },
    )
    aoConcluir(`${contratos.length} contratos importados.`)
    aoFechar()
  }

  return (
    <Modal titulo="Importar CSV" aoFechar={aoFechar} largo>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <label className="btn btn-primario">
            Escolher arquivo
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={lerArquivo} />
          </label>
          <button type="button" className="btn btn-secundario" onClick={() => setVerModelo((v) => !v)}>
            Baixar modelo CSV
          </button>
        </div>

        {verModelo && (
          <div>
            <label className="rotulo" htmlFor="modelo-csv">Modelo: copie este texto e salve como .csv</label>
            <textarea id="modelo-csv" readOnly rows={5} className="campo font-mono text-xs!" value={MODELO} onFocus={(e) => e.target.select()} />
            <button type="button" className="btn btn-secundario mt-2" onClick={() => setTexto(MODELO)}>
              Usar o modelo como teste
            </button>
          </div>
        )}

        <div>
          <label className="rotulo" htmlFor="texto-csv">Ou cole aqui o conteúdo do CSV</label>
          <textarea id="texto-csv" rows={4} className="campo font-mono text-xs!" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={COLUNAS.join(',')} />
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-slate-800">
          <input type="checkbox" className="h-5 w-5 shrink-0 accent-marca-700" checked={anonimizar} onChange={(e) => setAnonimizar(e.target.checked)} />
          Anonimizar nomes ao importar
        </label>

        <fieldset>
          <legend className="rotulo">Como importar</legend>
          <div className="flex flex-col gap-1">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-800">
              <input type="radio" name="modo" className="h-5 w-5 shrink-0 accent-marca-700" checked={modo === 'somar'} onChange={() => setModo('somar')} />
              Somar à base atual
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-800">
              <input type="radio" name="modo" className="h-5 w-5 shrink-0 accent-marca-700" checked={modo === 'substituir'} onChange={() => setModo('substituir')} />
              Substituir a base (apaga a carteira e o funil atuais)
            </label>
          </div>
        </fieldset>

        {analise?.erro && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">{analise.erro}</p>}

        {analise && !analise.erro && (
          <section>
            <h3 className="text-sm text-slate-900">
              Prévia: {analise.validas.length} válidas{analise.ignoradas.length > 0 && `, ${analise.ignoradas.length} ignoradas`}
            </h3>
            <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 px-3 text-sm">
              {analise.validas.slice(0, 6).map((l, i) => (
                <li key={`${l.nome}-${i}`} className="flex justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-900">{nomeFinal(l, i)}</span>
                    <span className="block text-xs text-slate-500">{l.cidade} · {l.qtd} elev. · vence {data(l.vencimento)}</span>
                  </span>
                  <span className="whitespace-nowrap text-slate-800">{moeda(l.valor)}</span>
                </li>
              ))}
            </ul>
            {analise.validas.length > 6 && <p className="mt-1 text-xs text-slate-500">E mais {analise.validas.length - 6} linhas.</p>}
            {analise.ignoradas.length > 0 && (
              <ul className="mt-2 text-xs text-red-800">
                {analise.ignoradas.slice(0, 5).map((m) => <li key={m}>{m}</li>)}
              </ul>
            )}
          </section>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-secundario" onClick={aoFechar}>Cancelar</button>
          <button type="button" className="btn btn-primario" onClick={importar} disabled={!analise || analise.validas.length === 0}>
            Importar
          </button>
        </div>
      </div>
    </Modal>
  )
}
