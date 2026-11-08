import type {
  EtapaFunil,
  GatilhoRegua,
  Origem,
  PassoRegua,
  StatusContrato,
  StatusEdital,
  StatusEnvio,
  TipoCliente,
  TipoContrato,
} from '../types'

export const ROTULO_STATUS: Record<StatusContrato, string> = {
  ativo: 'Ativo',
  vencendo: 'Vencendo',
  vencido: 'Vencido',
  perdido: 'Perdido',
}

export const ROTULO_TIPO_CONTRATO: Record<TipoContrato, string> = {
  sem_pecas: 'Sem peças',
  com_pecas: 'Com peças',
}

export const ROTULO_TIPO_CLIENTE: Record<TipoCliente, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  misto: 'Misto',
  publico: 'Público',
}

export const ROTULO_ORIGEM: Record<Origem, string> = {
  novo: 'Novo',
  renovacao: 'Renovação',
  modernizacao: 'Modernização',
  licitacao: 'Licitação',
  indicacao: 'Indicação',
}

export const ETAPAS: { id: EtapaFunil; nome: string }[] = [
  { id: 'prospeccao', nome: 'Prospecção' },
  { id: 'contato', nome: 'Contato' },
  { id: 'visita_tecnica', nome: 'Visita técnica' },
  { id: 'proposta', nome: 'Proposta' },
  { id: 'negociacao', nome: 'Negociação' },
  { id: 'ganho', nome: 'Ganho' },
  { id: 'perdido', nome: 'Perdido' },
]

export const ROTULO_GATILHO: Record<GatilhoRegua, string> = {
  dias_antes_vencimento: 'Dias antes do vencimento',
  dias_apos_vencimento: 'Dias após o vencimento',
  dias_apos_servico: 'Dias após o serviço',
  dias_sem_resposta_orcamento: 'Dias sem resposta do orçamento',
}

export function descreverPasso({ gatilho, dias }: Pick<PassoRegua, 'gatilho' | 'dias'>) {
  const d = `${dias} ${dias === 1 ? 'dia' : 'dias'}`
  if (gatilho === 'dias_antes_vencimento') return `${d} antes do vencimento`
  if (gatilho === 'dias_apos_vencimento') return `${d} após o vencimento`
  if (gatilho === 'dias_apos_servico') return `${d} após o serviço`
  return `${d} sem resposta do orçamento`
}

export const ROTULO_EDITAL: Record<StatusEdital, string> = {
  monitorando: 'Monitorando',
  documentacao: 'Documentação',
  proposta_enviada: 'Proposta enviada',
  ganho: 'Ganho',
  perdido: 'Perdido',
  descartado: 'Descartado',
}

export const ROTULO_ENVIO: Record<StatusEnvio, string> = {
  fila: 'Na fila',
  enviado: 'Enviado',
  respondido: 'Respondido',
}

export const MOTIVOS_PERDA = ['preço', 'concorrente', 'atendimento', 'fechou prédio']

export const MARCAS = ['Atlas Schindler', 'Otis', 'TK Elevator', 'Orona', 'Villarta', 'Thyssenkrupp']
