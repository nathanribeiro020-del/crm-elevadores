import { MessageCircle, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEstado } from '../data/contexto'
import { data, diasEntre, moeda } from '../lib/format'
import { historicoDeMensagens } from '../lib/kpis'
import { ROTULO_ORIGEM, ROTULO_TIPO_CLIENTE, ROTULO_TIPO_CONTRATO } from '../lib/rotulos'
import type { Cliente, Contrato } from '../types'
import { Modal } from './Modal'
import { PilulaStatus } from './Pilula'

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-500">{rotulo}</dt>
      <dd className="text-right font-medium text-slate-800">{children}</dd>
    </div>
  )
}

interface DetalheContratoProps {
  contrato: Contrato
  cliente: Cliente
  aoFechar: () => void
  aoCriarOportunidade: () => void
}

export function DetalheContrato({ contrato, cliente, aoFechar, aoCriarOportunidade }: DetalheContratoProps) {
  const { estado, hoje } = useEstado()
  const mensagens = historicoDeMensagens(contrato, estado.segmentos, hoje)
  const dias = diasEntre(hoje, contrato.vencimento)

  return (
    <Modal titulo={cliente.nome} aoFechar={aoFechar} lateral>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <PilulaStatus status={contrato.status} />
          <span className="text-sm text-slate-500">{dias >= 0 ? `Vence em ${dias} dias` : `Venceu há ${-dias} dias`}</span>
        </div>

        <section>
          <h3 className="text-sm text-slate-900">Cliente</h3>
          <dl className="mt-1 divide-y divide-slate-100">
            <Linha rotulo="Tipo">{ROTULO_TIPO_CLIENTE[cliente.tipo]}</Linha>
            <Linha rotulo="Local">{cliente.bairro}, {cliente.cidade}</Linha>
            <Linha rotulo="Síndico">{cliente.sindico || 'Não informado'}</Linha>
            <Linha rotulo="Telefone">{cliente.telefone || 'Não informado'}</Linha>
            {cliente.administradora && <Linha rotulo="Administradora">{cliente.administradora}</Linha>}
          </dl>
        </section>

        <section>
          <h3 className="text-sm text-slate-900">Contrato</h3>
          <dl className="mt-1 divide-y divide-slate-100">
            <Linha rotulo="Elevadores">{contrato.qtdElevadores}</Linha>
            <Linha rotulo="Marca">{contrato.marca}</Linha>
            <Linha rotulo="Ano do equipamento">{contrato.anoEquipamento || 'Não informado'}</Linha>
            <Linha rotulo="Tipo">{ROTULO_TIPO_CONTRATO[contrato.tipo]}</Linha>
            <Linha rotulo="Valor mensal">{moeda(contrato.valorMensal)}</Linha>
            <Linha rotulo="Início">{data(contrato.inicio)}</Linha>
            <Linha rotulo="Vencimento">{data(contrato.vencimento)}</Linha>
            <Linha rotulo="Origem">{ROTULO_ORIGEM[contrato.origem]}</Linha>
            {contrato.motivoPerda && <Linha rotulo="Motivo da perda">{contrato.motivoPerda}</Linha>}
          </dl>
        </section>

        <section>
          <h3 className="text-sm text-slate-900">Histórico de mensagens (simulado)</h3>
          {mensagens.length === 0 ? (
            <p className="mt-1 text-sm text-slate-500">Nenhuma mensagem enviada até agora.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {mensagens.map((m) => (
                <li key={m.id} className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  <span className="block text-xs text-slate-500">{data(m.data)}</span>
                  {m.texto}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-2">
          <button type="button" className="btn btn-primario" onClick={aoCriarOportunidade}>
            <Plus size={16} aria-hidden="true" />
            Criar oportunidade
          </button>
          <a href={`#/regua?cliente=${cliente.id}`} className="btn btn-secundario" onClick={aoFechar}>
            <MessageCircle size={16} aria-hidden="true" />
            Ver régua deste cliente
          </a>
        </div>
      </div>
    </Modal>
  )
}
