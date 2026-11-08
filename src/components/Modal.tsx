import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  titulo: string
  aoFechar: () => void
  children: ReactNode
  /** Abre como painel na lateral direita, em vez de janela centralizada. */
  lateral?: boolean
  largo?: boolean
}

export function Modal({ titulo, aoFechar, children, lateral = false, largo = false }: ModalProps) {
  const painel = useRef<HTMLDivElement>(null)
  const fechar = useRef(aoFechar)

  useEffect(() => {
    fechar.current = aoFechar
  }, [aoFechar])

  useEffect(() => {
    const focoAnterior = document.activeElement as HTMLElement | null
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    painel.current?.focus()

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar.current()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflowAnterior
      focoAnterior?.focus()
    }
  }, [])

  const posicao = lateral
    ? 'justify-end'
    : 'items-end justify-center md:items-center md:p-6'
  const forma = lateral
    ? 'h-full w-full max-w-md'
    : `max-h-[92dvh] w-full rounded-t-2xl md:rounded-2xl ${largo ? 'md:max-w-3xl' : 'md:max-w-lg'}`

  return (
    <div className={`fixed inset-0 z-50 flex bg-slate-900/50 print:hidden ${posicao}`} onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={`surgir flex flex-col bg-white outline-none ${forma}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 pl-5 pr-2">
          <h2 className="truncate text-lg text-slate-900">{titulo}</h2>
          <button type="button" onClick={aoFechar} aria-label="Fechar" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-seguro-extra">{children}</div>
      </div>
    </div>
  )
}
