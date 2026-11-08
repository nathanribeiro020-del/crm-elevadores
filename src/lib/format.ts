const moedaBR = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const moedaInteira = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})
const numeroBR = new Intl.NumberFormat('pt-BR')

export const moeda = (valor: number) => moedaBR.format(valor)
export const moedaSemCentavos = (valor: number) => moedaInteira.format(valor)
export const numero = (valor: number) => numeroBR.format(valor)
export const porcentagem = (valor: number, casas = 0) => `${valor.toFixed(casas).replace('.', ',')}%`

/** Valor abreviado para eixos de gráfico: R$ 45 mil, R$ 1,2 mi. */
export function moedaEixo(valor: number) {
  // Espaço não separável: o rótulo do eixo nunca quebra em duas linhas.
  if (Math.abs(valor) >= 1_000_000) return `R$ ${(valor / 1_000_000).toFixed(1).replace('.', ',')} mi`
  if (Math.abs(valor) >= 1_000) return `R$ ${Math.round(valor / 1_000)} mil`
  return `R$ ${Math.round(valor)}`
}

const doisDigitos = (n: number) => String(n).padStart(2, '0')

function paraISO(y: number, m: number, d: number) {
  return `${y}-${doisDigitos(m)}-${doisDigitos(d)}`
}

function partes(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d }
}

export function hojeISO() {
  const agora = new Date()
  return paraISO(agora.getFullYear(), agora.getMonth() + 1, agora.getDate())
}

const emDiasUTC = (iso: string) => {
  const { y, m, d } = partes(iso)
  return Date.UTC(y, m - 1, d) / 86_400_000
}

/** Quantos dias faltam de `de` até `ate` (negativo se `ate` já passou). */
export const diasEntre = (de: string, ate: string) => emDiasUTC(ate) - emDiasUTC(de)

export function somarDias(iso: string, dias: number) {
  const data = new Date(emDiasUTC(iso) * 86_400_000 + dias * 86_400_000)
  return paraISO(data.getUTCFullYear(), data.getUTCMonth() + 1, data.getUTCDate())
}

export function somarMeses(iso: string, meses: number) {
  const { y, m, d } = partes(iso)
  const alvo = new Date(Date.UTC(y, m - 1 + meses, 1))
  const ano = alvo.getUTCFullYear()
  const mes = alvo.getUTCMonth() + 1
  const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  return paraISO(ano, mes, Math.min(d, ultimoDia))
}

/** Converte ISO para dd/mm/aaaa. */
export function data(iso?: string) {
  if (!iso) return '-'
  const { y, m, d } = partes(iso)
  return `${doisDigitos(d)}/${doisDigitos(m)}/${y}`
}

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

/** "2026-05" vira "mai/26". */
export function mesCurto(mes: string) {
  const [y, m] = mes.split('-').map(Number)
  return `${MESES_CURTOS[m - 1]}/${String(y).slice(2)}`
}

/** "2026-05-10" vira "maio de 2026". */
export function mesExtenso(iso: string) {
  const { y, m } = partes(iso)
  return `${MESES[m - 1]} de ${y}`
}

/** Identificador curto de ID para registros novos. */
export const novoId = (prefixo: string) =>
  `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
