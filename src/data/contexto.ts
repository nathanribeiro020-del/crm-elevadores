import { createContext, useContext } from 'react'
import type { Estado } from '../types'

export interface ValorContexto {
  estado: Estado
  hoje: string
  atualizar: (mudanca: (atual: Estado) => Estado) => void
  restaurar: () => void
}

export const ContextoEstado = createContext<ValorContexto | null>(null)

export function useEstado() {
  const valor = useContext(ContextoEstado)
  if (!valor) throw new Error('useEstado precisa estar dentro de ProvedorEstado')
  return valor
}
