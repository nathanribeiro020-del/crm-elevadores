import { MoreHorizontal } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useEstado } from '../data/contexto'
import { Modal } from './Modal'
import { Selo } from './Selo'
import { MENU, MENU_INFERIOR, MENU_MAIS } from './navegacao'
import { CONFIG } from '../config'

function Logo({ nome }: { nome: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold leading-tight text-white">{nome}</p>
      <p className="truncate text-xs text-white/70">{CONFIG.subtitulo}</p>
    </div>
  )
}

function Sidebar({ atual, empresa }: { atual: string; empresa: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-marca-900 p-4 md:flex print:hidden">
      <div className="px-2 py-3">
        <Logo nome={empresa} />
      </div>
      <nav aria-label="Menu principal" className="mt-4 flex flex-1 flex-col gap-1">
        {MENU.map(({ caminho, nome, icone: Icone }) => {
          const ativo = caminho === atual
          return (
            <a
              key={caminho}
              href={`#/${caminho}`}
              aria-current={ativo ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                ativo ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icone size={18} aria-hidden="true" />
              {nome}
            </a>
          )
        })}
      </nav>
      <div className="px-2 py-2">
        <Selo escuro real={atual === 'historico'} />
      </div>
    </aside>
  )
}

function BarraTopo({ atual, empresa }: { atual: string; empresa: string }) {
  return (
    <header className="pt-seguro sticky top-0 z-30 bg-marca-900 md:hidden print:hidden">
      <div className="flex min-h-14 items-center justify-between gap-3 px-4">
        <Logo nome={empresa} />
        <div className="shrink-0">
          <Selo escuro real={atual === 'historico'} />
        </div>
      </div>
    </header>
  )
}

function MenuInferior({ atual }: { atual: string }) {
  const [maisAberto, setMaisAberto] = useState(false)
  const emMais = MENU_MAIS.some((m) => m.caminho === atual)
  const classe = (ativo: boolean) =>
    `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${ativo ? 'text-marca-700' : 'text-slate-500'}`

  return (
    <>
      <nav aria-label="Menu principal" className="pb-seguro fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white md:hidden print:hidden">
        <div className="grid grid-cols-5">
          {MENU_INFERIOR.map(({ caminho, nome, icone: Icone }) => (
            <a key={caminho} href={`#/${caminho}`} aria-current={caminho === atual ? 'page' : undefined} className={classe(caminho === atual)}>
              <Icone size={22} aria-hidden="true" />
              {nome}
            </a>
          ))}
          <button type="button" onClick={() => setMaisAberto(true)} className={classe(emMais)}>
            <MoreHorizontal size={22} aria-hidden="true" />
            Mais
          </button>
        </div>
      </nav>

      {maisAberto && (
        <Modal titulo="Mais opções" aoFechar={() => setMaisAberto(false)}>
          <div className="flex flex-col gap-1">
            {MENU_MAIS.map(({ caminho, nome, icone: Icone }) => (
              <a
                key={caminho}
                href={`#/${caminho}`}
                onClick={() => setMaisAberto(false)}
                className={`flex min-h-12 items-center gap-3 rounded-lg px-3 font-medium ${
                  caminho === atual ? 'bg-marca-50 text-marca-800' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icone size={20} aria-hidden="true" />
                {nome}
              </a>
            ))}
          </div>
        </Modal>
      )}
    </>
  )
}

export function Layout({ atual, children }: { atual: string; children: ReactNode }) {
  const { estado } = useEstado()
  const empresa = estado.config.empresa

  return (
    <div className="min-h-dvh md:pl-60 print:pl-0">
      <Sidebar atual={atual} empresa={empresa} />
      <BarraTopo atual={atual} empresa={empresa} />
      <main className="conteudo-principal mx-auto max-w-7xl px-4 pt-5 md:px-8 md:pt-8 print:max-w-none print:p-0">{children}</main>
      <MenuInferior atual={atual} />
    </div>
  )
}
