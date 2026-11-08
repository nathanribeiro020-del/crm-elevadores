import type { Cliente, Contrato } from '../types'
import { data, moeda } from './format'

export const VARIAVEIS = ['{sindico}', '{condominio}', '{vencimento}', '{valor}', '{empresa}'] as const

export interface DadosMensagem {
  cliente: Cliente
  contrato?: Contrato
  empresa: string
}

/** Substitui as variáveis da mensagem pelos dados reais do cliente selecionado. */
export function preencherMensagem(mensagem: string, { cliente, contrato, empresa }: DadosMensagem) {
  const valores: Record<string, string> = {
    '{sindico}': cliente.sindico || 'responsável',
    '{condominio}': cliente.nome,
    '{vencimento}': data(contrato?.vencimento),
    '{valor}': contrato ? moeda(contrato.valorMensal) : '-',
    '{empresa}': empresa,
  }
  return mensagem.replace(/\{(sindico|condominio|vencimento|valor|empresa)\}/g, (v) => valores[v])
}
