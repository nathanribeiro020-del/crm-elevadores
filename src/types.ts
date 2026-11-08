export type StatusContrato = 'ativo' | 'vencendo' | 'vencido' | 'perdido'
export type TipoContrato = 'sem_pecas' | 'com_pecas'
export type Origem = 'novo' | 'renovacao' | 'modernizacao' | 'licitacao' | 'indicacao'
export type TipoCliente = 'residencial' | 'comercial' | 'misto' | 'publico'

export interface Cliente {
  id: string
  nome: string
  tipo: TipoCliente
  bairro: string
  cidade: string
  sindico: string
  telefone: string
  administradora?: string
}

export interface Contrato {
  id: string
  clienteId: string
  qtdElevadores: number
  marca: string
  anoEquipamento: number
  tipo: TipoContrato
  valorMensal: number
  inicio: string
  vencimento: string
  status: StatusContrato
  origem: Origem
  motivoPerda?: string
  /** Data da última visita técnica; alimenta o gatilho "dias após serviço". */
  ultimoServico?: string
  /** Lançado à mão ou importado: as datas não são reajustadas com o passar dos dias. */
  manual?: boolean
}

export type EtapaFunil =
  | 'prospeccao'
  | 'contato'
  | 'visita_tecnica'
  | 'proposta'
  | 'negociacao'
  | 'ganho'
  | 'perdido'

export interface Oportunidade {
  id: string
  clienteId: string
  titulo: string
  origem: Origem
  valorMensal?: number
  valorUnico?: number
  etapa: EtapaFunil
  responsavel: string
  proximaAcao: string
  dataProximaAcao: string
  criadoEm: string
  motivoPerda?: string
  /** Data de envio do orçamento; alimenta o gatilho "dias sem resposta". */
  orcamentoEnviadoEm?: string
  manual?: boolean
}

export type GatilhoRegua =
  | 'dias_antes_vencimento'
  | 'dias_apos_vencimento'
  | 'dias_apos_servico'
  | 'dias_sem_resposta_orcamento'

export interface PassoRegua {
  id: string
  gatilho: GatilhoRegua
  dias: number
  mensagem: string
  ativo: boolean
}

export interface Segmento {
  id: string
  nome: string
  periodicidadeMeses: number
  passos: PassoRegua[]
}

export type StatusEdital =
  | 'monitorando'
  | 'documentacao'
  | 'proposta_enviada'
  | 'ganho'
  | 'perdido'
  | 'descartado'

export interface Edital {
  id: string
  orgao: string
  objeto: string
  uf: 'GO' | 'DF'
  exclusivoMeEpp: boolean
  valorEstimadoAnual: number
  dataAbertura: string
  status: StatusEdital
}

export type StatusEnvio = 'fila' | 'enviado' | 'respondido'

export interface Configuracoes {
  empresa: string
  responsavel: string
  metaRenovacao: number
  metaNovosMes: number
}

export interface Estado {
  versao: number
  /** Dia em que as datas fictícias foram geradas ou reajustadas pela última vez. */
  ancora: string
  config: Configuracoes
  clientes: Cliente[]
  contratos: Contrato[]
  oportunidades: Oportunidade[]
  segmentos: Segmento[]
  editais: Edital[]
  filaStatus: Record<string, StatusEnvio>
  checklist: Record<string, boolean>
}
