import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { COR_EIXO, COR_GRADE, COR_SERIE } from '../lib/cores'
import { moeda, moedaEixo } from '../lib/format'
import type { PontoMensal } from '../lib/kpis'
import { AreaGrafico, DicaGrafico } from './Grafico'

interface GraficoReceitaProps {
  serie: PontoMensal[]
  altura?: number
  /** Desligada no relatório para o gráfico sair completo na impressão. */
  animar?: boolean
}

export function GraficoReceita({ serie, altura = 260, animar = true }: GraficoReceitaProps) {
  const ultimo = serie[serie.length - 1]
  return (
    <AreaGrafico altura={altura} descricao={`Receita recorrente mensal nos últimos 12 meses, terminando em ${moeda(ultimo.mrr)}.`}>
      <AreaChart data={serie} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="preenchimentoReceita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COR_SERIE.principal} stopOpacity={0.28} />
            <stop offset="100%" stopColor={COR_SERIE.principal} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={COR_GRADE} vertical={false} />
        <XAxis dataKey="rotulo" tick={{ fill: COR_EIXO, fontSize: 11 }} tickLine={false} axisLine={{ stroke: COR_GRADE }} minTickGap={18} />
        <YAxis tickFormatter={moedaEixo} tick={{ fill: COR_EIXO, fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
        <Tooltip content={<DicaGrafico formatar={moeda} />} cursor={{ stroke: COR_EIXO, strokeDasharray: '3 3' }} />
        <Area
          type="monotone"
          dataKey="mrr"
          name="Receita mensal"
          stroke={COR_SERIE.principal}
          strokeWidth={2}
          fill="url(#preenchimentoReceita)"
          isAnimationActive={animar}
          activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </AreaGrafico>
  )
}
