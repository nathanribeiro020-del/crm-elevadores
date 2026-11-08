import { CONFIG } from '../config'
import { diasEntre, hojeISO, somarDias } from '../lib/format'
import type { Contrato, Estado, StatusContrato } from '../types'
import { VERSAO_DADOS, gerarEstado } from './seed'

const CHAVE = 'crm-elevadores:estado'

export function statusPorData(contrato: Pick<Contrato, 'status' | 'vencimento'>, hoje = hojeISO()): StatusContrato {
  if (contrato.status === 'perdido') return 'perdido'
  const dias = diasEntre(hoje, contrato.vencimento)
  if (dias < 0) return 'vencido'
  if (dias <= CONFIG.janelaVencimentoDias) return 'vencendo'
  return 'ativo'
}

/**
 * Empurra as datas fictícias para acompanhar o calendário, mantendo a demonstração
 * igual em qualquer dia. Registros lançados à mão ou importados não mudam.
 */
function reancorar(estado: Estado, hoje: string): Estado {
  const delta = diasEntre(estado.ancora, hoje)
  if (delta === 0) return estado
  const mover = (iso: string) => somarDias(iso, delta)
  const moverOpcional = (iso?: string) => (iso ? mover(iso) : iso)

  return {
    ...estado,
    ancora: hoje,
    filaStatus: {},
    contratos: estado.contratos.map((c) =>
      c.manual
        ? c
        : { ...c, inicio: mover(c.inicio), vencimento: mover(c.vencimento), ultimoServico: moverOpcional(c.ultimoServico) },
    ),
    oportunidades: estado.oportunidades.map((o) =>
      o.manual
        ? o
        : {
            ...o,
            dataProximaAcao: mover(o.dataProximaAcao),
            criadoEm: mover(o.criadoEm),
            orcamentoEnviadoEm: moverOpcional(o.orcamentoEnviadoEm),
          },
    ),
    editais: estado.editais.map((e) => ({ ...e, dataAbertura: mover(e.dataAbertura) })),
  }
}

function atualizarStatus(estado: Estado, hoje: string): Estado {
  return { ...estado, contratos: estado.contratos.map((c) => ({ ...c, status: statusPorData(c, hoje) })) }
}

export function carregarEstado(): Estado {
  const hoje = hojeISO()
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo) {
      const estado = JSON.parse(salvo) as Estado
      if (estado.versao === VERSAO_DADOS) return atualizarStatus(reancorar(estado, hoje), hoje)
    }
  } catch {
    // Armazenamento indisponível ou corrompido: segue com os dados de demonstração.
  }
  return gerarEstado(hoje)
}

export function salvarEstado(estado: Estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado))
  } catch {
    // Modo privado ou cota cheia: a demonstração continua funcionando em memória.
  }
}

export function restaurarDemonstracao(): Estado {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // Ignorado de propósito: o estado novo é devolvido mesmo sem armazenamento.
  }
  return gerarEstado(hojeISO())
}
