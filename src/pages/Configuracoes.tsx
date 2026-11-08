import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Cabecalho } from '../components/Cabecalho'
import { Campo } from '../components/Campo'
import { Modal } from '../components/Modal'
import { useEstado } from '../data/contexto'
import type { Configuracoes as TipoConfiguracoes } from '../types'

export default function Configuracoes() {
  const { estado, atualizar, restaurar } = useEstado()
  const { config } = estado
  const [confirmando, setConfirmando] = useState(false)
  const [restaurado, setRestaurado] = useState(false)

  const mudar = (mudanca: Partial<TipoConfiguracoes>) => {
    setRestaurado(false)
    atualizar((e) => ({ ...e, config: { ...e.config, ...mudanca } }))
  }

  return (
    <>
      <Cabecalho titulo="Configurações" descricao="As alterações são salvas automaticamente neste navegador." />

      <section className="cartao grid max-w-2xl grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <Campo rotulo="Nome da empresa" className="sm:col-span-2">
          <input className="campo" value={config.empresa} onChange={(e) => mudar({ empresa: e.target.value })} />
        </Campo>
        <Campo rotulo="Responsável comercial" className="sm:col-span-2">
          <input className="campo" value={config.responsavel} onChange={(e) => mudar({ responsavel: e.target.value })} />
        </Campo>
        <Campo rotulo="Meta de renovação (%)">
          <input type="number" min={0} max={100} className="campo" value={config.metaRenovacao} onChange={(e) => mudar({ metaRenovacao: Number(e.target.value) })} />
        </Campo>
        <Campo rotulo="Meta de novos contratos por mês">
          <input type="number" min={0} className="campo" value={config.metaNovosMes} onChange={(e) => mudar({ metaNovosMes: Number(e.target.value) })} />
        </Campo>
      </section>

      <section className="cartao mt-3 max-w-2xl p-4">
        <h2 className="text-base text-slate-900">Dados de demonstração</h2>
        <p className="mt-1 text-sm text-slate-500">Volta a carteira, o funil, a régua e as configurações ao estado original.</p>
        <button type="button" className="btn btn-secundario mt-3" onClick={() => setConfirmando(true)}>
          <RotateCcw size={16} aria-hidden="true" />
          Restaurar dados de demonstração
        </button>
        {restaurado && <p role="status" className="mt-2 text-sm text-emerald-800">Dados de demonstração restaurados.</p>}
      </section>

      {confirmando && (
        <Modal titulo="Restaurar dados?" aoFechar={() => setConfirmando(false)}>
          <p className="text-sm text-slate-600">Tudo o que foi alterado ou importado neste navegador será substituído pelos dados de demonstração.</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="btn btn-secundario" onClick={() => setConfirmando(false)}>Cancelar</button>
            <button
              type="button"
              className="btn btn-perigo"
              onClick={() => {
                restaurar()
                setConfirmando(false)
                setRestaurado(true)
              }}
            >
              Restaurar
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
