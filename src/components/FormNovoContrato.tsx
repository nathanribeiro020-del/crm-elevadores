import { useState, type FormEvent } from 'react'
import { useEstado } from '../data/contexto'
import { statusPorData } from '../data/storage'
import { novoId, somarMeses } from '../lib/format'
import { MARCAS, ROTULO_ORIGEM, ROTULO_TIPO_CLIENTE, ROTULO_TIPO_CONTRATO } from '../lib/rotulos'
import type { Cliente, Contrato, Origem, TipoCliente, TipoContrato } from '../types'
import { Campo } from './Campo'
import { Modal } from './Modal'

export function FormNovoContrato({ aoFechar }: { aoFechar: () => void }) {
  const { atualizar, hoje } = useEstado()
  const [f, setF] = useState({
    nome: '',
    tipoCliente: 'residencial' as TipoCliente,
    cidade: 'Goiânia',
    bairro: '',
    sindico: '',
    telefone: '',
    qtd: '2',
    marca: MARCAS[0],
    ano: '2012',
    tipo: 'sem_pecas' as TipoContrato,
    valor: '1800',
    inicio: hoje,
    origem: 'novo' as Origem,
  })
  const campo = <K extends keyof typeof f>(chave: K, valor: (typeof f)[K]) => setF((atual) => ({ ...atual, [chave]: valor }))

  function salvar(e: FormEvent) {
    e.preventDefault()
    const clienteId = novoId('cli')
    const cliente: Cliente = {
      id: clienteId,
      nome: f.nome.trim(),
      tipo: f.tipoCliente,
      bairro: f.bairro.trim(),
      cidade: f.cidade.trim(),
      sindico: f.sindico.trim(),
      telefone: f.telefone.trim(),
    }
    const base = { status: 'ativo' as const, vencimento: somarMeses(f.inicio, 12) }
    const contrato: Contrato = {
      ...base,
      id: novoId('ctr'),
      clienteId,
      qtdElevadores: Number(f.qtd),
      marca: f.marca,
      anoEquipamento: Number(f.ano),
      tipo: f.tipo,
      valorMensal: Number(f.valor),
      inicio: f.inicio,
      status: statusPorData(base, hoje),
      origem: f.origem,
      manual: true,
    }
    atualizar((e) => ({ ...e, clientes: [...e.clientes, cliente], contratos: [...e.contratos, contrato] }))
    aoFechar()
  }

  return (
    <Modal titulo="Novo contrato" aoFechar={aoFechar} largo>
      <form onSubmit={salvar} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 sm:col-span-2">Use apenas dados fictícios nesta demonstração.</p>
        <Campo rotulo="Condomínio" className="sm:col-span-2">
          <input required className="campo" value={f.nome} onChange={(e) => campo('nome', e.target.value)} placeholder="Residencial Exemplo" />
        </Campo>
        <Campo rotulo="Tipo de cliente">
          <select className="campo" value={f.tipoCliente} onChange={(e) => campo('tipoCliente', e.target.value as TipoCliente)}>
            {Object.entries(ROTULO_TIPO_CLIENTE).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Origem">
          <select className="campo" value={f.origem} onChange={(e) => campo('origem', e.target.value as Origem)}>
            {Object.entries(ROTULO_ORIGEM).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Cidade">
          <input required className="campo" value={f.cidade} onChange={(e) => campo('cidade', e.target.value)} />
        </Campo>
        <Campo rotulo="Bairro">
          <input required className="campo" value={f.bairro} onChange={(e) => campo('bairro', e.target.value)} />
        </Campo>
        <Campo rotulo="Síndico">
          <input className="campo" value={f.sindico} onChange={(e) => campo('sindico', e.target.value)} />
        </Campo>
        <Campo rotulo="Telefone">
          <input className="campo" inputMode="tel" value={f.telefone} onChange={(e) => campo('telefone', e.target.value)} placeholder="(62) 90000-0000" />
        </Campo>
        <Campo rotulo="Elevadores">
          <input required type="number" min={1} className="campo" value={f.qtd} onChange={(e) => campo('qtd', e.target.value)} />
        </Campo>
        <Campo rotulo="Marca">
          <select className="campo" value={f.marca} onChange={(e) => campo('marca', e.target.value)}>
            {MARCAS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Ano do equipamento">
          <input required type="number" min={1950} max={2100} className="campo" value={f.ano} onChange={(e) => campo('ano', e.target.value)} />
        </Campo>
        <Campo rotulo="Tipo de contrato">
          <select className="campo" value={f.tipo} onChange={(e) => campo('tipo', e.target.value as TipoContrato)}>
            {Object.entries(ROTULO_TIPO_CONTRATO).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Valor mensal (R$)">
          <input required type="number" min={1} step="0.01" className="campo" value={f.valor} onChange={(e) => campo('valor', e.target.value)} />
        </Campo>
        <Campo rotulo="Início (vencimento em 12 meses)">
          <input required type="date" className="campo" value={f.inicio} onChange={(e) => campo('inicio', e.target.value)} />
        </Campo>
        <div className="flex justify-end gap-2 pt-1 sm:col-span-2">
          <button type="button" className="btn btn-secundario" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="btn btn-primario">Salvar contrato</button>
        </div>
      </form>
    </Modal>
  )
}
