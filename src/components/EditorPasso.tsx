import { Eye, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { ROTULO_GATILHO } from '../lib/rotulos'
import { VARIAVEIS } from '../lib/template'
import type { GatilhoRegua, PassoRegua } from '../types'
import { Campo } from './Campo'

interface EditorPassoProps {
  passo: PassoRegua
  numero: number
  emPrevia: boolean
  aoMudar: (mudanca: Partial<PassoRegua>) => void
  aoExcluir: () => void
  aoVerPrevia: () => void
}

export function EditorPasso({ passo, numero, emPrevia, aoMudar, aoExcluir, aoVerPrevia }: EditorPassoProps) {
  const areaTexto = useRef<HTMLTextAreaElement>(null)

  function inserirVariavel(variavel: string) {
    const area = areaTexto.current
    const inicio = area?.selectionStart ?? passo.mensagem.length
    const fim = area?.selectionEnd ?? passo.mensagem.length
    aoMudar({ mensagem: passo.mensagem.slice(0, inicio) + variavel + passo.mensagem.slice(fim) })
    requestAnimationFrame(() => {
      if (!area) return
      const posicao = inicio + variavel.length
      area.focus()
      area.setSelectionRange(posicao, posicao)
    })
  }

  return (
    <article className={`cartao p-4 ${emPrevia ? 'border-marca-400! ring-1 ring-marca-400' : ''} ${passo.ativo ? '' : 'bg-slate-50!'}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm text-slate-900">Passo {numero}</h3>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-5 w-5 accent-marca-700" checked={passo.ativo} onChange={(e) => aoMudar({ ativo: e.target.checked })} />
          {passo.ativo ? 'Ativo' : 'Inativo'}
        </label>
      </div>

      <div className="mt-2 grid grid-cols-[1fr_84px] gap-3">
        <Campo rotulo="Gatilho">
          <select className="campo" value={passo.gatilho} onChange={(e) => aoMudar({ gatilho: e.target.value as GatilhoRegua })}>
            {Object.entries(ROTULO_GATILHO).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Dias">
          <input type="number" min={0} className="campo" value={passo.dias} onChange={(e) => aoMudar({ dias: Math.max(0, Number(e.target.value)) })} />
        </Campo>
      </div>

      <Campo rotulo="Mensagem" className="mt-3">
        <textarea ref={areaTexto} rows={4} className="campo" value={passo.mensagem} onChange={(e) => aoMudar({ mensagem: e.target.value })} onFocus={aoVerPrevia} />
      </Campo>

      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Inserir variável na mensagem">
        {VARIAVEIS.map((v) => (
          <button key={v} type="button" onClick={() => inserirVariavel(v)} className="min-h-11 rounded-full bg-marca-50 px-3 text-xs font-medium text-marca-800 hover:bg-marca-100">
            {v}
          </button>
        ))}
      </div>

      <div className="mt-3 flex justify-between gap-2">
        <button type="button" className="btn btn-secundario" onClick={aoVerPrevia}>
          <Eye size={16} aria-hidden="true" />
          Ver prévia
        </button>
        <button type="button" className="btn text-red-700 hover:bg-red-50" onClick={aoExcluir}>
          <Trash2 size={16} aria-hidden="true" />
          Excluir
        </button>
      </div>
    </article>
  )
}
