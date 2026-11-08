import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ContextoEstado } from '../data/contexto'
import { carregarEstado, restaurarDemonstracao, salvarEstado } from '../data/storage'
import type { Estado } from '../types'

export function ProvedorEstado({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(carregarEstado)

  useEffect(() => {
    salvarEstado(estado)
  }, [estado])

  const atualizar = useCallback((mudanca: (atual: Estado) => Estado) => setEstado(mudanca), [])
  const restaurar = useCallback(() => setEstado(restaurarDemonstracao()), [])

  const valor = useMemo(() => ({ estado, hoje: estado.ancora, atualizar, restaurar }), [estado, atualizar, restaurar])

  return <ContextoEstado.Provider value={valor}>{children}</ContextoEstado.Provider>
}
