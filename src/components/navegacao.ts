import {
  ClipboardList,
  FileText,
  Gavel,
  KanbanSquare,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Trophy,
  type LucideIcon,
} from 'lucide-react'

export interface ItemMenu {
  caminho: string
  nome: string
  icone: LucideIcon
}

/** "Meu histórico" é sempre o último item, como pede o roteiro. */
export const MENU: ItemMenu[] = [
  { caminho: 'painel', nome: 'Painel', icone: LayoutDashboard },
  { caminho: 'carteira', nome: 'Carteira', icone: ClipboardList },
  { caminho: 'funil', nome: 'Funil', icone: KanbanSquare },
  { caminho: 'regua', nome: 'Régua', icone: MessageCircle },
  { caminho: 'licitacoes', nome: 'Licitações', icone: Gavel },
  { caminho: 'relatorio', nome: 'Relatório', icone: FileText },
  { caminho: 'configuracoes', nome: 'Configurações', icone: Settings },
  { caminho: 'historico', nome: 'Meu histórico', icone: Trophy },
]

export const MENU_INFERIOR = MENU.slice(0, 4)
export const MENU_MAIS = MENU.slice(4)
