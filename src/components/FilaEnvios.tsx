import { RotateCcw, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useEstado } from '../data/contexto'
import { filaDeHoje, type ItemFila } from '../lib/kpis'
import { ROTULO_ENVIO } from '../lib/rotulos'
import type { PassoRegua, StatusEnvio } from '../types'
import { EstadoVazio } from './EstadoVazio'
import { Pilula, type TomPilula } from './Pilula'

const TOM_ENVIO: Record<StatusEnvio, TomPilula> = { fila: 'cinza', enviado: 'marca', respondido: 'verde' }

export function descreverPasso({ gatilho, dias }: Pick<PassoRegua, 'gatilho' | 'dias'>) {
  const d = `${dias} ${dias === 1 ? 'dia' : 'dias'}`
  if (gatilho === 'dias_antes_vencimento') return `${d} antes do vencimento`
  if (gatilho === 'dias_apos_vencimento') return `${d} após o vencimento`
  if (gatilho === 'dias_apos_servico') return `${d} após o serviço`
  return `${d} sem resposta do orçamento`
}

export function FilaEnvios({ aoVerPrevia }: { aoVerPrevia: (item: ItemFila) => void }) {
  const { estado, atualizar, hoje } = useEstado()
  const fila = filaDeHoje(estado, hoje)
  const [simulando, setSimulando] = useState(false)
  const temporizadores = useRef<number[]>([])

  useEffect(() => () => temporizadores.current.forEach(window.clearTimeout), [])

  const definir = (chave: string, status: StatusEnvio) =>
    atualizar((e) => ({ ...e, filaStatus: { ...e.filaStatus, [chave]: status } }))

  function simular() {
    const pendentes = fila.filter((i) => i.status === 'fila')
    setSimulando(true)
    pendentes.forEach((item, i) => {
      temporizadores.current.push(window.setTimeout(() => definir(item.chave, 'enviado'), 450 * (i + 1)))
    })
    const fim = 450 * (pendentes.length + 1)
    // Na simulação, um a cada três clientes responde logo depois do envio.
    pendentes.filter((_, i) => i % 3 === 0).forEach((item, i) => {
      temporizadores.current.push(window.setTimeout(() => definir(item.chave, 'respondido'), fim + 500 * i))
    })
    temporizadores.current.push(window.setTimeout(() => setSimulando(false), fim + 500 * Math.ceil(pendentes.length / 3)))
  }

  const reiniciar = () => atualizar((e) => ({ ...e, filaStatus: {} }))
  const haPendentes = fila.some((i) => i.status === 'fila')

  return (
    <section className="cartao mt-3 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base text-slate-900">Fila de envios de hoje</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Na versão de produção, os envios saem pela API do WhatsApp, com limite diário e intervalos para proteger o número.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {!haPendentes && fila.length > 0 && (
            <button type="button" className="btn btn-secundario" onClick={reiniciar} disabled={simulando}>
              <RotateCcw size={16} aria-hidden="true" />
              Reiniciar
            </button>
          )}
          <button type="button" className="btn btn-primario" onClick={simular} disabled={simulando || !haPendentes}>
            <Send size={16} aria-hidden="true" />
            {simulando ? 'Enviando…' : 'Simular envio'}
          </button>
        </div>
      </div>

      {fila.length === 0 ? (
        <EstadoVazio titulo="Nenhum envio programado para hoje" texto="Nenhum cliente atinge um passo ativo da régua nesta data." />
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {fila.map((item) => (
            <li key={item.chave} className="flex items-center justify-between gap-3 py-2">
              <button type="button" onClick={() => aoVerPrevia(item)} className="min-h-11 min-w-0 flex-1 text-left">
                <span className="block truncate font-medium text-slate-900">{item.cliente.nome}</span>
                <span className="block truncate text-xs text-slate-500">{descreverPasso(item.passo)} · {item.segmento.nome}</span>
              </button>
              <span key={item.status} className="surgir shrink-0" role="status">
                <Pilula tom={TOM_ENVIO[item.status]}>{ROTULO_ENVIO[item.status]}</Pilula>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
