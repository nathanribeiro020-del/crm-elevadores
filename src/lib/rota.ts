import { useEffect, useState } from 'react'

export interface Rota {
  caminho: string
  parametros: URLSearchParams
}

function lerRota(): Rota {
  const bruto = window.location.hash.replace(/^#\/?/, '')
  const [caminho, busca] = bruto.split('?')
  return { caminho: caminho || 'painel', parametros: new URLSearchParams(busca ?? '') }
}

/** Rotas por hash (#/carteira): funcionam em hospedagem estática sem configuração. */
export function useRota() {
  const [rota, setRota] = useState<Rota>(lerRota)

  useEffect(() => {
    const aoMudar = () => {
      setRota(lerRota())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])

  return rota
}

export function irPara(caminho: string) {
  window.location.hash = `/${caminho}`
}
