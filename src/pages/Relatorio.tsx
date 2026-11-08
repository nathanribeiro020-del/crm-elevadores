import { Printer } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { GraficoReceita } from '../components/GraficoReceita'
import { KpiTile } from '../components/KpiTile'
import { PilulaEdital } from '../components/PilulaEdital'
import { Selo } from '../components/Selo'
import { useEstado } from '../data/contexto'
import { data, mesExtenso, moeda, moedaSemCentavos, numero, porcentagem, somarMeses } from '../lib/format'
import { calcularIndicadores, clientePorId, estaVigente, serieMensal, valorOportunidade } from '../lib/kpis'

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-6 break-inside-avoid">
      <h2 className="border-b border-slate-300 pb-1 text-base text-marca-900">{titulo}</h2>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function Vazio({ children }: { children: ReactNode }) {
  return <p className="py-2 text-sm text-slate-500">{children}</p>
}

const contratosNoPlural = (n: number) => `${numero(n)} ${n === 1 ? 'contrato' : 'contratos'}`

export default function Relatorio() {
  const { estado, hoje } = useEstado()
  const kpi = useMemo(() => calcularIndicadores(estado, hoje), [estado, hoje])
  const serie = useMemo(() => serieMensal(estado.contratos, hoje), [estado.contratos, hoje])
  const clientes = useMemo(() => clientePorId(estado.clientes), [estado.clientes])
  const { config } = estado

  const proximoMes = somarMeses(hoje, 1).slice(0, 7)
  const vencemProximoMes = estado.contratos
    .filter((c) => estaVigente(c) && c.vencimento.startsWith(proximoMes))
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
  const emNegociacao = estado.oportunidades.filter((o) => o.etapa === 'negociacao')
  const editaisAndamento = estado.editais.filter((e) => e.status === 'documentacao' || e.status === 'proposta_enviada')

  const diferencaMeta = Math.round(kpi.taxaRenovacao) - config.metaRenovacao
  const situacaoMeta =
    diferencaMeta === 0
      ? `exatamente na meta de ${porcentagem(config.metaRenovacao)}`
      : `${Math.abs(diferencaMeta)} pontos ${diferencaMeta > 0 ? 'acima' : 'abaixo'} da meta de ${porcentagem(config.metaRenovacao)}`

  const resumo = [
    `A carteira encerra o período com ${contratosNoPlural(kpi.contratosAtivos)} ativos e receita recorrente de ${moeda(kpi.mrr)} por mês, atendendo ${numero(kpi.elevadores)} elevadores.`,
    `Nos próximos 60 dias vencem ${contratosNoPlural(kpi.vencendoQtd)}, com ${moeda(kpi.emRisco)} mensais em risco, e a taxa de renovação está em ${porcentagem(kpi.taxaRenovacao)}, ${situacaoMeta}.`,
    `O pipeline aberto soma ${moeda(kpi.pipeline)}, com ${numero(emNegociacao.length)} oportunidades em negociação e ${numero(editaisAndamento.length)} editais em andamento.`,
  ]

  return (
    <>
      <div className="mx-auto mb-3 flex max-w-[767px] justify-end print:hidden">
        <button type="button" className="btn btn-primario" onClick={() => window.print()}>
          <Printer size={16} aria-hidden="true" />
          Imprimir / Salvar em PDF
        </button>
      </div>

      {/* A largura interna de 703px corresponde à área útil de uma folha A4 com margens de 12 mm. */}
      <article className="cartao mx-auto max-w-[767px] p-5 sm:p-8 print:max-w-none print:rounded-none print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-marca-800 pb-3">
          <div>
            <p className="text-sm font-semibold text-marca-800">{config.empresa}</p>
            <h1 className="text-2xl text-slate-900">Relatório mensal</h1>
            <p className="text-sm capitalize-first text-slate-500">
              {mesExtenso(hoje)} · Responsável: {config.responsavel}
            </p>
          </div>
          <Selo />
        </header>

        <Secao titulo="Resumo executivo">
          <div className="space-y-1.5 text-sm leading-relaxed text-slate-700">
            {resumo.map((frase) => <p key={frase}>{frase}</p>)}
          </div>
        </Secao>

        <Secao titulo="Indicadores principais">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 print:grid-cols-3">
            <KpiTile rotulo="Receita recorrente mensal" valor={moedaSemCentavos(kpi.mrr)} />
            <KpiTile rotulo="Contratos ativos" valor={numero(kpi.contratosAtivos)} detalhe={`${numero(kpi.elevadores)} elevadores`} />
            <KpiTile alerta rotulo="Vencendo em 60 dias" valor={numero(kpi.vencendoQtd)} detalhe={`${moedaSemCentavos(kpi.emRisco)}/mês`} />
            <KpiTile rotulo="Taxa de renovação" valor={porcentagem(kpi.taxaRenovacao)} detalhe={`Meta: ${porcentagem(config.metaRenovacao)}`} />
            <KpiTile rotulo="Ticket por elevador" valor={moedaSemCentavos(kpi.ticketPorElevador)} />
            <KpiTile rotulo="Pipeline aberto" valor={moedaSemCentavos(kpi.pipeline)} />
          </div>
        </Secao>

        <Secao titulo="Receita recorrente mensal (12 meses)">
          <GraficoReceita serie={serie} altura={210} animar={false} />
        </Secao>

        <Secao titulo="Contratos que vencem no próximo mês">
          {vencemProximoMes.length === 0 ? (
            <Vazio>Nenhum contrato vence no próximo mês.</Vazio>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-slate-500">
                <tr>
                  <th className="py-1 pr-2 font-semibold">Condomínio</th>
                  <th className="py-1 pr-2 font-semibold">Vencimento</th>
                  <th className="py-1 text-right font-semibold">Valor mensal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vencemProximoMes.map((c) => (
                  <tr key={c.id} className="break-inside-avoid">
                    <td className="py-1.5 pr-2 text-slate-800">{clientes.get(c.clienteId)?.nome}</td>
                    <td className="py-1.5 pr-2 text-slate-600">{data(c.vencimento)}</td>
                    <td className="whitespace-nowrap py-1.5 text-right text-slate-800">{moeda(c.valorMensal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Secao>

        <Secao titulo="Oportunidades em negociação">
          {emNegociacao.length === 0 ? (
            <Vazio>Nenhuma oportunidade em negociação no momento.</Vazio>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {emNegociacao.map((o) => (
                <li key={o.id} className="flex justify-between gap-3 py-1.5 break-inside-avoid">
                  <span className="min-w-0 text-slate-800">
                    {clientes.get(o.clienteId)?.nome}
                    <span className="block text-xs text-slate-500">{o.titulo}</span>
                  </span>
                  <span className="whitespace-nowrap text-slate-800">{moeda(valorOportunidade(o))}</span>
                </li>
              ))}
            </ul>
          )}
        </Secao>

        <Secao titulo="Editais em andamento">
          {editaisAndamento.length === 0 ? (
            <Vazio>Nenhum edital em andamento no momento.</Vazio>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {editaisAndamento.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 py-1.5 break-inside-avoid">
                  <span className="min-w-0 text-slate-800">
                    {e.orgao}
                    <span className="block text-xs text-slate-500">Abertura {data(e.dataAbertura)} · {moeda(e.valorEstimadoAnual)}/ano</span>
                  </span>
                  <PilulaEdital status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </Secao>
      </article>
    </>
  )
}
