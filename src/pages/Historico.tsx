import { CalendarDays, CircleDollarSign, FileCheck2, Receipt, RefreshCcw, Sparkles } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Cabecalho } from '../components/Cabecalho'
import { AreaGrafico, CartaoGrafico, DicaGrafico } from '../components/Grafico'
import { KpiTile } from '../components/KpiTile'
import { Selo } from '../components/Selo'
import historico from '../data/historico_agregado.json'
import { COR_EIXO, COR_GRADE, COR_SERIE } from '../lib/cores'
import { mesCurto, moeda, moedaEixo, moedaSemCentavos, numero, porcentagem } from '../lib/format'

interface Fatia {
  nome: string
  contratos: number
  ticketMedio: number
}

const NAO_INFORMADO = 'Não informado'
const NOMES_ESTADOS: Record<string, string> = { Goias: 'Goiás', 'Sao Paulo': 'São Paulo' }

const { totais } = historico
const serie = historico.porMes.map((m) => ({
  rotulo: mesCurto(m.mes),
  novos: m.novos,
  renovacoes: m.renovacoes,
  valor: m.valorNovos + m.valorRenovacoes,
}))
const estados = historico.porEstado
  .filter((e) => e.nome !== NAO_INFORMADO)
  .map((e) => ({ nome: NOMES_ESTADOS[e.nome] ?? e.nome, contratos: e.contratos }))
const semClassificacao = historico.porTipoEquipamento.find((t) => t.nome === NAO_INFORMADO)?.contratos ?? 0
const tipos = historico.porTipoEquipamento.filter((t) => t.nome !== NAO_INFORMADO)

function fraseDestaque() {
  const parteNovos = (totais.novos / totais.contratos) * 100
  const novos = parteNovos >= 45 && parteNovos <= 55 ? 'metade deles novos' : `${porcentagem(parteNovos)} deles novos`
  return `${numero(totais.contratos)} contratos em ${historico.periodo.meses} meses: média de ${Math.round(totais.mediaContratosPorMes)} por mês, ${novos}.`
}

function Rosca({ titulo, fatias }: { titulo: string; fatias: Fatia[] }) {
  const cores = [COR_SERIE.principal, COR_SERIE.segunda]
  const total = fatias.reduce((s, f) => s + f.contratos, 0)
  return (
    <CartaoGrafico titulo={titulo} descricao="Quantidade de contratos e ticket médio">
      <div className="relative">
        <AreaGrafico altura={180} descricao={fatias.map((f) => `${f.nome}: ${f.contratos} contratos`).join('; ')}>
          <PieChart>
            <Pie data={fatias} dataKey="contratos" nameKey="nome" innerRadius={56} outerRadius={80} paddingAngle={2} stroke="#fff" strokeWidth={2} startAngle={90} endAngle={-270}>
              {fatias.map((f, i) => <Cell key={f.nome} fill={cores[i]} />)}
            </Pie>
            <Tooltip content={<DicaGrafico formatar={numero} />} />
          </PieChart>
        </AreaGrafico>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xl font-semibold text-slate-900">{numero(total)}</p>
            <p className="text-xs text-slate-500">contratos</p>
          </div>
        </div>
      </div>
      <ul className="mt-2 divide-y divide-slate-100 text-sm">
        {fatias.map((f, i) => (
          <li key={f.nome} className="flex items-center justify-between gap-3 py-1.5">
            <span className="flex items-center gap-2 text-slate-700">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: cores[i] }} />
              {f.nome}
            </span>
            <span className="text-right text-slate-900">
              {numero(f.contratos)} ({porcentagem((f.contratos / total) * 100)})
              <span className="block text-xs text-slate-500">Ticket {moedaSemCentavos(f.ticketMedio)}</span>
            </span>
          </li>
        ))}
      </ul>
    </CartaoGrafico>
  )
}

export default function Historico() {
  return (
    <>
      <Cabecalho titulo="Meu histórico" descricao={`Resultados do responsável comercial, de ${mesCurto(historico.periodo.inicio)} a ${mesCurto(historico.periodo.fim)}.`} />
      <div className="mb-4">
        <Selo real />
      </div>

      <div className="mb-3 flex items-start gap-3 rounded-xl bg-marca-900 p-4 text-white">
        <Sparkles size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-marca-200" />
        <p className="text-lg font-semibold leading-snug">{fraseDestaque()}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiTile rotulo="Contratos fechados" valor={numero(totais.contratos)} detalhe={`Em ${historico.periodo.meses} meses`} icone={FileCheck2} />
        <KpiTile rotulo="Novos" valor={numero(totais.novos)} detalhe={`${moedaSemCentavos(totais.valorNovos)} em contratos`} icone={Sparkles} />
        <KpiTile rotulo="Renovações" valor={numero(totais.renovacoes)} detalhe={`${moedaSemCentavos(totais.valorRenovacoes)} em contratos`} icone={RefreshCcw} />
        <KpiTile rotulo="Valor total em contratos" valor={moedaSemCentavos(totais.valorTotal)} detalhe="Base anual" icone={CircleDollarSign} />
        <KpiTile rotulo="Ticket médio" valor={moeda(totais.ticketMedio)} detalhe="Por contrato" icone={Receipt} />
        <KpiTile rotulo="Média por mês" valor={totais.mediaContratosPorMes.toFixed(1).replace('.', ',')} detalhe="Contratos fechados" icone={CalendarDays} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <CartaoGrafico titulo="Contratos e valor fechados por mês" descricao="Novos e renovações em quantidade; abaixo, o valor total de cada mês" className="lg:col-span-2">
          <AreaGrafico altura={240} descricao="Contratos novos e renovações em cada mês do período, em barras empilhadas.">
            <BarChart data={serie} syncId="historico" margin={{ top: 8, right: 8, left: -14, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid stroke={COR_GRADE} vertical={false} />
              <XAxis dataKey="rotulo" tick={{ fill: COR_EIXO, fontSize: 11 }} tickLine={false} axisLine={{ stroke: COR_GRADE }} minTickGap={18} />
              <YAxis allowDecimals={false} tick={{ fill: COR_EIXO, fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<DicaGrafico />} cursor={{ fill: '#f1f5f9' }} itemSorter={() => 0} />
              <Legend iconType="circle" iconSize={8} itemSorter={null} wrapperStyle={{ fontSize: 12, color: '#475569' }} />
              <Bar dataKey="novos" name="Novos" stackId="total" fill={COR_SERIE.principal} stroke="#fff" strokeWidth={1} />
              <Bar dataKey="renovacoes" name="Renovações" stackId="total" fill={COR_SERIE.segunda} stroke="#fff" strokeWidth={1} radius={[4, 4, 0, 0]} />
            </BarChart>
          </AreaGrafico>
          <p className="mb-1 mt-3 text-xs font-semibold text-slate-600">Valor total do mês</p>
          <AreaGrafico altura={150} descricao="Valor total dos contratos fechados em cada mês do período.">
            <LineChart data={serie} syncId="historico" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={COR_GRADE} vertical={false} />
              <XAxis dataKey="rotulo" tick={{ fill: COR_EIXO, fontSize: 11 }} tickLine={false} axisLine={{ stroke: COR_GRADE }} minTickGap={18} />
              <YAxis tickFormatter={moedaEixo} tick={{ fill: COR_EIXO, fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
              <Tooltip content={<DicaGrafico formatar={moeda} />} cursor={{ stroke: COR_EIXO, strokeDasharray: '3 3' }} />
              <Line type="monotone" dataKey="valor" name="Valor do mês" stroke={COR_SERIE.principal} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </AreaGrafico>
        </CartaoGrafico>

        <Rosca titulo="Residencial e comercial" fatias={tipos} />
        <Rosca titulo="Centralizado e descentralizado" fatias={historico.porZona} />

        <CartaoGrafico titulo="Estados atendidos" descricao="Ranking por quantidade de contratos" className="lg:col-span-2">
          <AreaGrafico altura={230} descricao={estados.map((e) => `${e.nome}: ${e.contratos}`).join('; ')}>
            <BarChart data={estados} layout="vertical" margin={{ top: 4, right: 36, left: 4, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="nome" width={112} tick={{ fill: '#334155', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<DicaGrafico />} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="contratos" name="Contratos" fill={COR_SERIE.principal} radius={[0, 4, 4, 0]} maxBarSize={18}>
                <LabelList dataKey="contratos" position="right" style={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </AreaGrafico>
        </CartaoGrafico>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Dados agregados, sem nomes de clientes. Valores conforme o total anual de cada contrato.
        {semClassificacao > 0 && ` ${semClassificacao} contrato sem classificação não aparece nos gráficos de tipo e de estado.`}
      </p>
    </>
  )
}
