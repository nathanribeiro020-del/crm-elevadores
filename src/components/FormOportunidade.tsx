import { useState, type FormEvent } from 'react'
import { useEstado } from '../data/contexto'
import { novoId, somarDias } from '../lib/format'
import { ETAPAS, ROTULO_ORIGEM } from '../lib/rotulos'
import type { EtapaFunil, Oportunidade, Origem } from '../types'
import { Campo } from './Campo'
import { Modal } from './Modal'

interface FormOportunidadeProps {
  clienteId?: string
  aoFechar: () => void
  aoSalvar?: () => void
}

export function FormOportunidade({ clienteId, aoFechar, aoSalvar }: FormOportunidadeProps) {
  const { estado, atualizar, hoje } = useEstado()
  const clientes = [...estado.clientes].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  const [f, setF] = useState({
    clienteId: clienteId ?? clientes[0]?.id ?? '',
    titulo: '',
    origem: 'renovacao' as Origem,
    tipoValor: 'mensal' as 'mensal' | 'unico',
    valor: '',
    etapa: 'prospeccao' as EtapaFunil,
    proximaAcao: 'Ligar para o síndico',
    dataProximaAcao: somarDias(hoje, 2),
  })
  const campo = <K extends keyof typeof f>(chave: K, valor: (typeof f)[K]) => setF((atual) => ({ ...atual, [chave]: valor }))

  function salvar(e: FormEvent) {
    e.preventDefault()
    const valor = Number(f.valor)
    const nova: Oportunidade = {
      id: novoId('oport'),
      clienteId: f.clienteId,
      titulo: f.titulo.trim(),
      origem: f.origem,
      valorMensal: f.tipoValor === 'mensal' ? valor : undefined,
      valorUnico: f.tipoValor === 'unico' ? valor : undefined,
      etapa: f.etapa,
      responsavel: estado.config.responsavel,
      proximaAcao: f.proximaAcao.trim(),
      dataProximaAcao: f.dataProximaAcao,
      criadoEm: hoje,
      manual: true,
    }
    atualizar((e) => ({ ...e, oportunidades: [...e.oportunidades, nova] }))
    aoSalvar?.()
    aoFechar()
  }

  if (clientes.length === 0) {
    return (
      <Modal titulo="Nova oportunidade" aoFechar={aoFechar}>
        <p className="text-sm text-slate-600">Cadastre um contrato na Carteira antes de criar uma oportunidade.</p>
      </Modal>
    )
  }

  return (
    <Modal titulo="Nova oportunidade" aoFechar={aoFechar}>
      <form onSubmit={salvar} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo rotulo="Condomínio" className="sm:col-span-2">
          <select className="campo" value={f.clienteId} onChange={(e) => campo('clienteId', e.target.value)}>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Título" className="sm:col-span-2">
          <input required className="campo" value={f.titulo} onChange={(e) => campo('titulo', e.target.value)} placeholder="Renovação 2 elevadores" />
        </Campo>
        <Campo rotulo="Origem">
          <select className="campo" value={f.origem} onChange={(e) => campo('origem', e.target.value as Origem)}>
            {Object.entries(ROTULO_ORIGEM).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Etapa">
          <select className="campo" value={f.etapa} onChange={(e) => campo('etapa', e.target.value as EtapaFunil)}>
            {ETAPAS.filter((et) => et.id !== 'perdido').map((et) => <option key={et.id} value={et.id}>{et.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Tipo de valor">
          <select className="campo" value={f.tipoValor} onChange={(e) => campo('tipoValor', e.target.value as 'mensal' | 'unico')}>
            <option value="mensal">Mensal (contrato)</option>
            <option value="unico">Único (modernização)</option>
          </select>
        </Campo>
        <Campo rotulo="Valor (R$)">
          <input required type="number" min={1} step="0.01" className="campo" value={f.valor} onChange={(e) => campo('valor', e.target.value)} />
        </Campo>
        <Campo rotulo="Próxima ação">
          <input required className="campo" value={f.proximaAcao} onChange={(e) => campo('proximaAcao', e.target.value)} />
        </Campo>
        <Campo rotulo="Data da próxima ação">
          <input required type="date" className="campo" value={f.dataProximaAcao} onChange={(e) => campo('dataProximaAcao', e.target.value)} />
        </Campo>
        <div className="flex justify-end gap-2 pt-1 sm:col-span-2">
          <button type="button" className="btn btn-secundario" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="btn btn-primario">Salvar oportunidade</button>
        </div>
      </form>
    </Modal>
  )
}
