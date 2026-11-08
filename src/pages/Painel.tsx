import { Banknote, Building2, Filter, Gauge, MessageCircle, RefreshCcw } from 'lucide-react'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { Cabecalho } from '../components/Cabecalho'
import { AreaGrafico, CartaoGrafico, DicaGrafico } from '../components/Grafico'
import { textoLegenda } from '../lib/legenda'
import { GraficoReceita } from '../components/GraficoReceita'
import { KpiTile } from '../components/KpiTile'
import { PilulaStatus } from '../components/Pilula'
import { useEstado } from '../data/contexto'
import { COR_EIXO, COR_GRADE, COR_SERIE } from '../lib/cores'
import { data, diasEntre, moeda, moedaSemCentavos, numero, porcentagem } from '../lib/format'
import { calcularIndicadores, clientePorId, motivosDePerda, proximosVencimentos, serieMensal } from '../lib/kpis'

export default function Painel() {
  const { estado, hoje } = useEstado()
  const kpi = useMemo(() => calcularIndicadores(estado, hoje), [estado, hoje])
  const serie = useMemo(() => serieMensal(estado.contratos, hoje), [estado.contratos, hoje])
  const motivos = useMemo(() => motivosDePerda(estado.contratos), [estado.contratos])
  const proximos = useMemo(() => proximosVencimentos(estado.contratos, 5), [estado.contratos])
  const clientes = useMemo(() => clientePorId(estado.clientes), [estado.clientes])

  return (
    <>
      <Cabecalho titulo="Painel" descricao="Visão da carteira, do risco de vencimento e do funil comercial." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiTile rotulo="Receita recorrente mensal" valor={moedaSemCentavos(kpi.mrr)} detalhe="Contratos ativos e vencendo" icone={Banknote} />
        <KpiTile rotulo="Contratos ativos" valor={numero(kpi.contratosAtivos)} detalhe={`${numero(kpi.elevadores)} elevadores atendidos`} icone={Building2} />
        <KpiTile alerta rotulo="Vencendo em 60 dias" valor={numero(kpi.vencendoQtd)} detalhe={`${moedaSemCentavos(kpi.emRisco)}/mês em risco`} />
        <KpiTile
          rotulo="Taxa de renovação (12 meses)"
          valor={porcentagem(kpi.taxaRenovacao)}
          detalhe={`Meta: ${porcentagem(estado.config.metaRenovacao)}`}
          icone={RefreshCcw}
        />
        <KpiTile rotulo="Ticket médio por elevador" valor={moedaSemCentavos(kpi.ticketPorElevador)} detalhe="Por mês" icone={Gauge} />
        <KpiTile rotulo="Pipeline aberto" valor={moedaSemCentavos(kpi.pipeline)} detalhe="Mensal e projetos únicos" icone={Filter} />
      </div>

      <section className="cartao mt-3 p-4">
        <h2 className="text-base text-slate-900">Ação hoje</h2>
        <p className="mt-0.5 text-xs text-slate-500">Os 5 contratos mais próximos do vencimento.</p>
        <ul className="mt-2 divide-y divide-slate-100">
          {proximos.map((c) => {
            const cliente = clientes.get(c.clienteId)
            const dias = diasEntre(hoje, c.vencimento)
            return (
              <li key={c.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{cliente?.nome}</p>
                  <p className="text-xs text-slate-500">
                    Vence em {data(c.vencimento)} ({dias} {dias === 1 ? 'dia' : 'dias'}) · {moeda(c.valorMensal)}/mês
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <PilulaStatus status={c.status} />
                  <a href={`#/regua?cliente=${c.clienteId}`} className="btn btn-secundario">
                    <MessageCircle size={16} aria-hidden="true" />
                    Ver régua
                  </a>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <CartaoGrafico titulo="Evolução da receita recorrente mensal" descricao="Últimos 12 meses" className="lg:col-span-2">
          <GraficoReceita serie={serie} />
        </CartaoGrafico>

        <CartaoGrafico titulo="Novos, renovados e perdidos por mês" descricao="Quantidade de contratos">
          <AreaGrafico altura={280} descricao="Contratos novos, renovados e perdidos em cada um dos últimos 12 meses.">
            <BarChart data={serie} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barGap={2} barCategoryGap="22%">
              <CartesianGrid stroke={COR_GRADE} vertical={false} />
              <XAxis dataKey="rotulo" tick={{ fill: COR_EIXO, fontSize: 11 }} tickLine={false} axisLine={{ stroke: COR_GRADE }} minTickGap={18} />
              <YAxis allowDecimals={false} tick={{ fill: COR_EIXO, fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<DicaGrafico />} cursor={{ fill: '#f1f5f9' }} itemSorter={() => 0} />
              <Legend iconType="circle" iconSize={8} itemSorter={null} formatter={textoLegenda} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="novos" name="Novos" fill={COR_SERIE.principal} radius={[4, 4, 0, 0]} maxBarSize={12} />
              <Bar dataKey="renovados" name="Renovados" fill={COR_SERIE.segunda} radius={[4, 4, 0, 0]} maxBarSize={12} />
              <Bar dataKey="perdidos" name="Perdidos" fill={COR_SERIE.perda} radius={[4, 4, 0, 0]} maxBarSize={12} />
            </BarChart>
          </AreaGrafico>
        </CartaoGrafico>

        <CartaoGrafico titulo="Motivos de perda" descricao="Contratos perdidos nos últimos 12 meses">
          <AreaGrafico altura={280} descricao={`Motivos de perda: ${motivos.map((m) => `${m.motivo}, ${m.quantidade}`).join('; ')}.`}>
            <BarChart data={motivos} layout="vertical" margin={{ top: 8, right: 28, left: 8, bottom: 0 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="motivo" width={104} tick={{ fill: '#334155', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<DicaGrafico />} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="quantidade" name="Contratos" fill={COR_SERIE.principal} radius={[0, 4, 4, 0]} maxBarSize={18}>
                <LabelList dataKey="quantidade" position="right" style={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </AreaGrafico>
        </CartaoGrafico>
      </div>
    </>
  )
}
