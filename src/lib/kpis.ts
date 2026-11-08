import type { Cliente, Contrato, Estado, Oportunidade, PassoRegua, Segmento, StatusEnvio } from '../types'
import { diasEntre, mesCurto, somarDias, somarMeses } from './format'

export const estaVigente = (c: Contrato) => c.status === 'ativo' || c.status === 'vencendo'
export const estaAberta = (o: Oportunidade) => o.etapa !== 'ganho' && o.etapa !== 'perdido'
export const valorOportunidade = (o: Oportunidade) => (o.valorMensal ?? 0) + (o.valorUnico ?? 0)

export const clientePorId = (clientes: Cliente[]) => new Map(clientes.map((c) => [c.id, c]))

/** Contratos fechados dentro dos últimos 12 meses (data de início dentro da janela). */
const naJanela = (iso: string, hoje: string) => iso > somarMeses(hoje, -12) && iso <= hoje

export function calcularIndicadores({ contratos, oportunidades }: Estado, hoje: string) {
  const vigentes = contratos.filter(estaVigente)
  const vencendo = contratos.filter((c) => c.status === 'vencendo')
  const mrr = vigentes.reduce((soma, c) => soma + c.valorMensal, 0)
  const elevadores = vigentes.reduce((soma, c) => soma + c.qtdElevadores, 0)

  const renovados = vigentes.filter((c) => c.origem === 'renovacao' && naJanela(c.inicio, hoje)).length
  const perdidos = contratos.filter((c) => c.status === 'perdido' && naJanela(c.vencimento, hoje)).length
  const vencidos = contratos.filter((c) => c.status === 'vencido').length
  const base = renovados + perdidos + vencidos

  return {
    mrr,
    contratosAtivos: vigentes.length,
    elevadores,
    vencendoQtd: vencendo.length,
    emRisco: vencendo.reduce((soma, c) => soma + c.valorMensal, 0),
    taxaRenovacao: base > 0 ? (renovados / base) * 100 : 0,
    renovados,
    perdidos,
    vencidos,
    ticketPorElevador: elevadores > 0 ? mrr / elevadores : 0,
    pipeline: oportunidades.filter(estaAberta).reduce((soma, o) => soma + valorOportunidade(o), 0),
  }
}

export interface PontoMensal {
  mes: string
  rotulo: string
  novos: number
  renovados: number
  perdidos: number
  mrr: number
}

/** Série dos últimos 12 meses, derivada da própria carteira para sempre bater com os indicadores. */
export function serieMensal(contratos: Contrato[], hoje: string): PontoMensal[] {
  const pontos: PontoMensal[] = []

  for (let i = 11; i >= 0; i--) {
    const referencia = somarMeses(hoje, -i)
    const mes = referencia.slice(0, 7)
    const noMes = (iso: string) => iso.startsWith(mes) && iso <= hoje
    // Fim do mês para meses fechados; o próprio dia de hoje para o mês corrente.
    const corte = i === 0 ? hoje : somarDias(somarMeses(`${mes}-01`, 1), -1)

    const ativoNoCorte = (c: Contrato) => {
      if (c.status === 'perdido' || c.status === 'vencido') {
        if (c.vencimento < corte) return false
        return i !== 0
      }
      return c.origem === 'renovacao' || c.inicio <= corte
    }

    pontos.push({
      mes,
      rotulo: mesCurto(mes),
      novos: contratos.filter((c) => c.origem !== 'renovacao' && estaVigente(c) && noMes(c.inicio)).length,
      renovados: contratos.filter((c) => c.origem === 'renovacao' && estaVigente(c) && noMes(c.inicio)).length,
      perdidos: contratos.filter((c) => c.status === 'perdido' && noMes(c.vencimento)).length,
      mrr: contratos.filter(ativoNoCorte).reduce((soma, c) => soma + c.valorMensal, 0),
    })
  }
  return pontos
}

export function motivosDePerda(contratos: Contrato[]) {
  const contagem = new Map<string, number>()
  contratos
    .filter((c) => c.status === 'perdido')
    .forEach((c) => {
      const motivo = c.motivoPerda || 'não informado'
      contagem.set(motivo, (contagem.get(motivo) ?? 0) + 1)
    })
  return [...contagem.entries()]
    .map(([motivo, quantidade]) => ({ motivo: motivo[0].toUpperCase() + motivo.slice(1), quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
}

export function proximosVencimentos(contratos: Contrato[], quantidade: number) {
  return contratos
    .filter(estaVigente)
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .slice(0, quantidade)
}

export interface ItemFila {
  chave: string
  segmento: Segmento
  passo: PassoRegua
  cliente: Cliente
  contrato?: Contrato
  status: StatusEnvio
}

/** Calcula quais clientes disparam algum passo ativo da régua na data de hoje. */
export function filaDeHoje(estado: Estado, hoje: string): ItemFila[] {
  const clientes = clientePorId(estado.clientes)
  const contratoDoCliente = new Map(estado.contratos.map((c) => [c.clienteId, c]))
  const itens: ItemFila[] = []

  const adicionar = (segmento: Segmento, passo: PassoRegua, clienteId: string, contrato?: Contrato) => {
    const cliente = clientes.get(clienteId)
    if (!cliente) return
    const chave = `${hoje}:${segmento.id}:${passo.id}:${clienteId}`
    itens.push({ chave, segmento, passo, cliente, contrato, status: estado.filaStatus[chave] ?? 'fila' })
  }

  for (const segmento of estado.segmentos) {
    for (const passo of segmento.passos) {
      if (!passo.ativo) continue

      if (passo.gatilho === 'dias_sem_resposta_orcamento') {
        estado.oportunidades
          .filter((o) => o.etapa === 'proposta' && o.orcamentoEnviadoEm && diasEntre(o.orcamentoEnviadoEm, hoje) === passo.dias)
          .forEach((o) => adicionar(segmento, passo, o.clienteId, contratoDoCliente.get(o.clienteId)))
        continue
      }

      for (const contrato of estado.contratos) {
        const dispara =
          (passo.gatilho === 'dias_antes_vencimento' && estaVigente(contrato) && diasEntre(hoje, contrato.vencimento) === passo.dias) ||
          (passo.gatilho === 'dias_apos_vencimento' && contrato.status === 'vencido' && diasEntre(contrato.vencimento, hoje) === passo.dias) ||
          (passo.gatilho === 'dias_apos_servico' &&
            estaVigente(contrato) &&
            contrato.ultimoServico !== undefined &&
            diasEntre(contrato.ultimoServico, hoje) === passo.dias)
        if (dispara) adicionar(segmento, passo, contrato.clienteId, contrato)
      }
    }
  }
  return itens
}

export interface MensagemHistorico {
  id: string
  data: string
  texto: string
}

/** Histórico simulado: passos de vencimento cuja data já passou, mais a mensagem de boas-vindas. */
export function historicoDeMensagens(contrato: Contrato, segmentos: Segmento[], hoje: string): MensagemHistorico[] {
  const lista: MensagemHistorico[] = [
    { id: 'boas-vindas', data: somarDias(contrato.inicio, 2), texto: 'Boas-vindas ao contrato de manutenção.' },
  ]
  for (const segmento of segmentos) {
    for (const passo of segmento.passos) {
      if (passo.gatilho !== 'dias_antes_vencimento' || !passo.ativo) continue
      const quando = somarDias(contrato.vencimento, -passo.dias)
      if (quando <= hoje) {
        lista.push({ id: passo.id, data: quando, texto: `Lembrete de ${passo.dias} dias antes do vencimento.` })
      }
    }
  }
  return lista.filter((m) => m.data <= hoje).sort((a, b) => b.data.localeCompare(a.data))
}
