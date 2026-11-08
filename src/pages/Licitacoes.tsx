import { CircleDollarSign, Eye, Hourglass, ShieldCheck } from 'lucide-react'
import { Cabecalho } from '../components/Cabecalho'
import { KpiTile } from '../components/KpiTile'
import { Pilula } from '../components/Pilula'
import { PilulaEdital } from '../components/PilulaEdital'
import { useEstado } from '../data/contexto'
import { data, moeda, moedaSemCentavos, numero } from '../lib/format'

const CHECKLIST = [
  { id: 'certidoes', nome: 'Certidões negativas', detalhe: 'Federal, estadual, municipal, FGTS e trabalhista' },
  { id: 'atestados', nome: 'Atestados de capacidade técnica', detalhe: 'Serviços similares em elevadores' },
  { id: 'crea', nome: 'Registro no CREA', detalhe: 'Empresa e responsável técnico' },
  { id: 'sicaf', nome: 'Cadastro no SICAF', detalhe: 'Cadastro de fornecedores atualizado' },
]

function SeloExclusivo() {
  return <Pilula tom="marca">Exclusivo ME/EPP</Pilula>
}

export default function Licitacoes() {
  const { estado, atualizar } = useEstado()
  const editais = [...estado.editais].sort((a, b) => a.dataAbertura.localeCompare(b.dataAbertura))
  const emDisputa = editais.filter((e) => ['monitorando', 'documentacao', 'proposta_enviada'].includes(e.status))
  const andamento = editais.filter((e) => e.status === 'documentacao' || e.status === 'proposta_enviada')
  const concluidos = CHECKLIST.filter((c) => estado.checklist[c.id]).length

  const marcar = (id: string, valor: boolean) => atualizar((e) => ({ ...e, checklist: { ...e.checklist, [id]: valor } }))

  return (
    <>
      <Cabecalho titulo="Licitações" descricao="Editais de manutenção de elevadores em Goiás e no Distrito Federal." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile rotulo="Editais monitorados" valor={numero(editais.filter((e) => e.status !== 'descartado').length)} detalhe="Exceto descartados" icone={Eye} />
        <KpiTile rotulo="Exclusivos ME/EPP" valor={numero(editais.filter((e) => e.exclusivoMeEpp).length)} detalhe="Menos concorrência" icone={ShieldCheck} />
        <KpiTile rotulo="Em andamento" valor={numero(andamento.length)} detalhe="Documentação ou proposta" icone={Hourglass} />
        <KpiTile rotulo="Valor total em disputa" valor={moedaSemCentavos(emDisputa.reduce((s, e) => s + e.valorEstimadoAnual, 0))} detalhe="Estimativa anual" icone={CircleDollarSign} />
      </div>

      <div className="cartao mt-3 hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs text-slate-500">
            <tr>
              <th className="px-3 py-3 font-semibold">Órgão</th>
              <th className="px-3 py-3 font-semibold">Objeto</th>
              <th className="px-3 py-3 font-semibold">UF</th>
              <th className="px-3 py-3 font-semibold">ME/EPP</th>
              <th className="px-3 py-3 text-right font-semibold">Valor anual</th>
              <th className="px-3 py-3 font-semibold">Abertura</th>
              <th className="px-3 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {editais.map((e) => (
              <tr key={e.id}>
                <td className="px-3 py-2.5 font-medium text-slate-900">{e.orgao}</td>
                <td className="px-3 py-2.5 text-slate-600">{e.objeto}</td>
                <td className="px-3 py-2.5 text-slate-600">{e.uf}</td>
                <td className="px-3 py-2.5">{e.exclusivoMeEpp ? <SeloExclusivo /> : <span className="text-slate-500">Ampla</span>}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right">{moeda(e.valorEstimadoAnual)}</td>
                <td className="px-3 py-2.5 text-slate-600">{data(e.dataAbertura)}</td>
                <td className="px-3 py-2.5"><PilulaEdital status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-3 flex flex-col gap-2 lg:hidden">
        {editais.map((e) => (
          <li key={e.id} className="cartao p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 font-medium text-slate-900">{e.orgao}</p>
              <PilulaEdital status={e.status} />
            </div>
            <p className="mt-1 text-sm text-slate-600">{e.objeto}</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-900">{moeda(e.valorEstimadoAnual)}</span>
              <span className="text-xs text-slate-500">{e.uf} · Abertura {data(e.dataAbertura)}</span>
            </div>
            {e.exclusivoMeEpp && <div className="mt-2"><SeloExclusivo /></div>}
          </li>
        ))}
      </ul>

      <section className="cartao mt-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base text-slate-900">Checklist de habilitação</h2>
          <span className="text-sm text-slate-500">{concluidos} de {CHECKLIST.length}</span>
        </div>
        <ul className="mt-2 divide-y divide-slate-100">
          {CHECKLIST.map((c) => (
            <li key={c.id}>
              <label className="flex min-h-14 cursor-pointer items-center gap-3 py-2">
                <input type="checkbox" className="h-5 w-5 shrink-0 accent-marca-700" checked={Boolean(estado.checklist[c.id])} onChange={(e) => marcar(c.id, e.target.checked)} />
                <span>
                  <span className="block text-sm font-medium text-slate-900">{c.nome}</span>
                  <span className="block text-xs text-slate-500">{c.detalhe}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
