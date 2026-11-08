import { CheckCheck } from 'lucide-react'

interface PreviaWhatsAppProps {
  empresa: string
  texto: string | null
}

/** Simulação visual de um celular com a mensagem já preenchida. */
export function PreviaWhatsApp({ empresa, texto }: PreviaWhatsAppProps) {
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-[2rem] border-[6px] border-slate-800 bg-slate-800 shadow-lg">
      <div className="flex items-center gap-2 rounded-t-[1.5rem] bg-[#075e54] px-3 py-3 text-white">
        <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/20 text-sm font-semibold">
          {empresa.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{empresa}</p>
          <p className="text-xs text-white/75">online</p>
        </div>
      </div>
      <div className="flex min-h-64 flex-col justify-end rounded-b-[1.5rem] bg-[#ece5dd] p-3">
        {texto ? (
          <div key={texto} className="surgir ml-auto max-w-[92%] rounded-lg rounded-tr-none bg-[#dcf8c6] px-3 py-2 text-sm leading-snug text-slate-900 shadow-sm">
            <p className="whitespace-pre-wrap break-words">{texto}</p>
            <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-slate-500">
              09:00
              <CheckCheck size={14} aria-hidden="true" className="text-sky-600" />
            </p>
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500">Adicione um passo para ver a prévia.</p>
        )}
      </div>
    </div>
  )
}
