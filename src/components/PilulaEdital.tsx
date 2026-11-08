import { ROTULO_EDITAL } from '../lib/rotulos'
import type { StatusEdital } from '../types'
import { Pilula, type TomPilula } from './Pilula'

const TOM_EDITAL: Record<StatusEdital, TomPilula> = {
  monitorando: 'cinza',
  documentacao: 'azul',
  proposta_enviada: 'marca',
  ganho: 'verde',
  perdido: 'vermelho',
  descartado: 'cinza',
}

export function PilulaEdital({ status }: { status: StatusEdital }) {
  return <Pilula tom={TOM_EDITAL[status]}>{ROTULO_EDITAL[status]}</Pilula>
}
