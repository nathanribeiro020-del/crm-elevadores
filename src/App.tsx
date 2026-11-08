import { Suspense, lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { Layout } from './components/Layout'
import { ProvedorEstado } from './components/ProvedorEstado'
import { useRota } from './lib/rota'

const PAGINAS: Record<string, LazyExoticComponent<ComponentType>> = {
  painel: lazy(() => import('./pages/Painel')),
  carteira: lazy(() => import('./pages/Carteira')),
  funil: lazy(() => import('./pages/Funil')),
  regua: lazy(() => import('./pages/Regua')),
  licitacoes: lazy(() => import('./pages/Licitacoes')),
  relatorio: lazy(() => import('./pages/Relatorio')),
  configuracoes: lazy(() => import('./pages/Configuracoes')),
  historico: lazy(() => import('./pages/Historico')),
}

function Carregando() {
  return (
    <p role="status" className="py-16 text-center text-sm text-slate-500">
      Carregando…
    </p>
  )
}

export default function App() {
  const { caminho } = useRota()
  const atual = PAGINAS[caminho] ? caminho : 'painel'
  const Pagina = PAGINAS[atual]

  return (
    <ProvedorEstado>
      <Layout atual={atual}>
        <Suspense fallback={<Carregando />}>
          <Pagina />
        </Suspense>
      </Layout>
    </ProvedorEstado>
  )
}
