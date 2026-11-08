import { CONFIG } from '../config'
import { hojeISO, somarDias, somarMeses } from '../lib/format'
import { MARCAS } from '../lib/rotulos'
import type {
  Cliente,
  Contrato,
  Edital,
  EtapaFunil,
  Estado,
  Oportunidade,
  Origem,
  Segmento,
  StatusContrato,
  TipoCliente,
} from '../types'

export const VERSAO_DADOS = 1

/** Gerador pseudoaleatório com semente fixa: a carteira sai sempre igual. */
function criarSorteio(semente: number) {
  let a = semente
  const proximo = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    entre: (min: number, max: number) => Math.floor(proximo() * (max - min + 1)) + min,
    item: <T,>(lista: readonly T[]) => lista[Math.floor(proximo() * lista.length)],
    embaralhar: <T,>(lista: readonly T[]) => {
      const copia = [...lista]
      for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(proximo() * (i + 1))
        ;[copia[i], copia[j]] = [copia[j], copia[i]]
      }
      return copia
    },
  }
}

const repetir = <T,>(valor: T, vezes: number): T[] => Array.from({ length: vezes }, () => valor)

const NOMES_RESIDENCIAIS = [
  'Residencial Ipê Amarelo',
  'Edifício Serra Azul',
  'Condomínio Vila Cerrado',
  'Residencial Buriti Alto',
  'Edifício Pequizeiro',
  'Condomínio Jatobá Real',
  'Residencial Aroeira do Vale',
  'Edifício Sucupira',
  'Condomínio Cagaita',
  'Residencial Mangaba',
  'Edifício Seriema',
  'Condomínio Lago Sereno',
  'Residencial Chapada Verde',
  'Edifício Flor do Cerrado',
  'Condomínio Canela de Ema',
  'Residencial Gameleira',
  'Edifício Bromélia Rosa',
  'Condomínio Jacarandá Azul',
  'Residencial Paineira Branca',
  'Edifício Angico',
  'Condomínio Sibipiruna',
  'Residencial Quaresmeira',
  'Edifício Manacá da Serra',
  'Condomínio Sempre Viva',
  'Residencial Arara Canindé',
  'Edifício Tuiuiú',
  'Condomínio Lobeira',
  'Residencial Barbatimão',
  'Edifício Copaíba',
  'Condomínio Tamboril',
]

const NOMES_COMERCIAIS = [
  'Centro Empresarial Araguaia',
  'Torre Comercial Baru',
  'Edifício Empresarial Murici',
  'Centro Médico Araticum',
  'Torre Empresarial Guariroba',
  'Centro Comercial Jenipapo',
  'Edifício Corporativo Vale do Sol',
  'Torre Comercial Vereda Alta',
  'Centro Empresarial Nascente Clara',
  'Edifício Comercial Sol Poente',
  'Centro Clínico Vereda Verde',
  'Torre Corporativa Alvorada Serena',
  'Centro Empresarial Mirante do Lago',
]

const NOMES_PUBLICOS = ['Prédio Administrativo Setor Norte', 'Unidade de Atendimento Setor Leste']
const NOME_MISTO = 'Conjunto Misto Rio Claro'

const BAIRROS: Record<string, string[]> = {
  Goiânia: [
    'Setor Bueno',
    'Setor Marista',
    'Setor Oeste',
    'Jardim Goiás',
    'Setor Sul',
    'Nova Suíça',
    'Alto da Glória',
    'Pedro Ludovico',
    'Park Lozandes',
    'Jardim América',
  ],
  'Aparecida de Goiânia': ['Cidade Vera Cruz', 'Jardim Luz', 'Setor Central'],
  Anápolis: ['Jundiaí', 'Centro', 'Maracanãzinho'],
  Trindade: ['Centro', 'Setor Maysa'],
  'Senador Canedo': ['Jardim das Oliveiras', 'Centro'],
  Brasília: ['Asa Sul', 'Águas Claras', 'Asa Norte'],
}

const PRENOMES = ['Marina', 'Paulo', 'Renata', 'Carlos', 'Helena', 'Jorge', 'Patrícia', 'Sérgio', 'Lúcia', 'Roberto', 'Camila', 'Fábio', 'Tereza', 'André', 'Beatriz', 'Otávio']
const SOBRENOMES = ['Almeida', 'Barros', 'Cardoso', 'Duarte', 'Esteves', 'Figueira', 'Guimarães', 'Teixeira', 'Moreira', 'Nogueira', 'Pacheco', 'Queiroz', 'Rezende', 'Siqueira']
const ADMINISTRADORAS = ['Administradora Alfa', 'Gestão Beta Condomínios', 'Predial Gama', 'Síndico Delta Serviços']
const RESPONSAVEIS = ['Ana Souza', 'Bruno Lima', 'Carla Mendes']

function gerarSegmentos(): Segmento[] {
  return [
    {
      id: 'seg-condominios',
      nome: 'Elevadores – Condomínios',
      periodicidadeMeses: 12,
      passos: [
        {
          id: 'passo-60',
          gatilho: 'dias_antes_vencimento',
          dias: 60,
          ativo: true,
          mensagem:
            'Olá, {sindico}! Aqui é da {empresa}. O contrato de manutenção dos elevadores do {condominio} vence em {vencimento} e queremos garantir a continuidade do atendimento. Podemos conversar sobre a renovação?',
        },
        {
          id: 'passo-30',
          gatilho: 'dias_antes_vencimento',
          dias: 30,
          ativo: true,
          mensagem:
            'Olá, {sindico}! Aqui é da {empresa}. O contrato de manutenção dos elevadores do {condominio} vence em {vencimento}. Preparamos a proposta de renovação mantendo a mesma equipe técnica que já conhece o seu equipamento. Posso te enviar?',
        },
        {
          id: 'passo-7',
          gatilho: 'dias_antes_vencimento',
          dias: 7,
          ativo: true,
          mensagem:
            'Olá, {sindico}! Passando para lembrar que o contrato do {condominio} vence em {vencimento}, com valor atual de {valor} por mês. Para não interromper a manutenção, posso confirmar a renovação hoje?',
        },
        {
          id: 'passo-orcamento',
          gatilho: 'dias_sem_resposta_orcamento',
          dias: 3,
          ativo: true,
          mensagem:
            'Olá, {sindico}! Conseguiu avaliar o orçamento que enviamos para o {condominio}? Se precisar de algum ajuste, é só me falar. Equipe {empresa}.',
        },
        {
          id: 'passo-servico',
          gatilho: 'dias_apos_servico',
          dias: 2,
          ativo: true,
          mensagem:
            'Olá, {sindico}! A equipe da {empresa} esteve no {condominio} há dois dias. De 0 a 10, como foi o atendimento? Se conhecer outro condomínio que precise de manutenção, ficaremos felizes com a indicação.',
        },
      ],
    },
  ]
}

function gerarEditais(hoje: string): Edital[] {
  const base: Omit<Edital, 'id' | 'dataAbertura'>[] = [
    { orgao: 'Órgão Municipal A – Goiânia', objeto: 'Manutenção preventiva e corretiva de 6 elevadores', uf: 'GO', exclusivoMeEpp: true, valorEstimadoAnual: 84_000, status: 'monitorando' },
    { orgao: 'Autarquia Estadual B – Goiás', objeto: 'Manutenção de elevadores com fornecimento de peças', uf: 'GO', exclusivoMeEpp: false, valorEstimadoAnual: 196_000, status: 'documentacao' },
    { orgao: 'Órgão Distrital C – Brasília', objeto: 'Manutenção de 4 elevadores e 1 plataforma', uf: 'DF', exclusivoMeEpp: true, valorEstimadoAnual: 72_500, status: 'proposta_enviada' },
    { orgao: 'Fundação Municipal D – Anápolis', objeto: 'Manutenção preventiva mensal de 2 elevadores', uf: 'GO', exclusivoMeEpp: true, valorEstimadoAnual: 31_200, status: 'documentacao' },
    { orgao: 'Secretaria Estadual E – Goiás', objeto: 'Modernização de 3 elevadores de uso público', uf: 'GO', exclusivoMeEpp: false, valorEstimadoAnual: 410_000, status: 'monitorando' },
    { orgao: 'Autarquia Distrital F – Brasília', objeto: 'Manutenção de elevadores em sede administrativa', uf: 'DF', exclusivoMeEpp: false, valorEstimadoAnual: 148_000, status: 'ganho' },
    { orgao: 'Órgão Municipal G – Aparecida de Goiânia', objeto: 'Manutenção de 2 elevadores em unidades de saúde', uf: 'GO', exclusivoMeEpp: true, valorEstimadoAnual: 38_400, status: 'perdido' },
    { orgao: 'Instituto Estadual H – Goiás', objeto: 'Manutenção de escadas rolantes e elevadores', uf: 'GO', exclusivoMeEpp: false, valorEstimadoAnual: 262_000, status: 'descartado' },
  ]
  const offsets = [18, 9, -4, 12, 34, -48, -22, -15]
  return base.map((e, i) => ({ ...e, id: `edital-${i + 1}`, dataAbertura: somarDias(hoje, offsets[i]) }))
}

interface MoldeOportunidade {
  contrato: Contrato
  titulo: string
  origem: Origem
  etapa: EtapaFunil
  valorMensal?: number
  valorUnico?: number
  proximaAcao: string
  motivoPerda?: string
}

const ACAO_POR_ETAPA: Record<EtapaFunil, string> = {
  prospeccao: 'Ligar para o síndico',
  contato: 'Agendar visita técnica',
  visita_tecnica: 'Realizar vistoria no local',
  proposta: 'Cobrar retorno da proposta',
  negociacao: 'Levar proposta final à assembleia',
  ganho: 'Enviar contrato para assinatura',
  perdido: 'Retomar contato em 6 meses',
}

function gerarOportunidades(contratos: Contrato[], hoje: string): Oportunidade[] {
  const por = (status: StatusContrato) => contratos.filter((c) => c.status === status)
  const vencendo = [...por('vencendo')].sort((a, b) => a.vencimento.localeCompare(b.vencimento))
  const vencidos = por('vencido')
  const perdidos = por('perdido')
  const antigos = [...por('ativo')].sort((a, b) => a.anoEquipamento - b.anoEquipamento)
  const publico = por('ativo').concat(vencendo).find((c) => c.origem === 'licitacao') ?? antigos[8]
  const reajuste = (c: Contrato) => Math.round(c.valorMensal * 1.06)

  const moldes: MoldeOportunidade[] = [
    ...vencendo.map((contrato, i): MoldeOportunidade => ({
      contrato,
      titulo: `Renovação ${contrato.qtdElevadores} ${contrato.qtdElevadores > 1 ? 'elevadores' : 'elevador'}`,
      origem: 'renovacao',
      etapa: (['contato', 'proposta', 'proposta', 'negociacao', 'visita_tecnica'] as EtapaFunil[])[i],
      valorMensal: reajuste(contrato),
      proximaAcao: i === 1 ? 'Enviar proposta de renovação' : '',
    })),
    ...vencidos.map((contrato, i): MoldeOportunidade => ({
      contrato,
      titulo: 'Renovação em atraso',
      origem: 'renovacao',
      etapa: (['contato', 'proposta', 'negociacao'] as EtapaFunil[])[i],
      valorMensal: contrato.valorMensal,
      proximaAcao: '',
    })),
    ...['Modernização de cabine', 'Modernização de comando', 'Troca de máquina de tração', 'Modernização de portas'].map(
      (titulo, i): MoldeOportunidade => ({
        contrato: antigos[i],
        titulo,
        origem: 'modernizacao',
        etapa: (['prospeccao', 'visita_tecnica', 'proposta', 'ganho'] as EtapaFunil[])[i],
        valorUnico: [68_000, 54_500, 92_000, 38_700][i],
        proximaAcao: '',
      }),
    ),
    ...perdidos.slice(0, 3).map((contrato, i): MoldeOportunidade => ({
      contrato,
      titulo: 'Reconquista de contrato',
      origem: 'novo',
      etapa: (['prospeccao', 'contato', 'perdido'] as EtapaFunil[])[i],
      valorMensal: contrato.valorMensal,
      proximaAcao: '',
      motivoPerda: i === 2 ? 'preço' : undefined,
    })),
    {
      contrato: publico,
      titulo: 'Aditivo de contrato público',
      origem: 'licitacao',
      etapa: 'visita_tecnica',
      valorMensal: 1_480,
      proximaAcao: '',
    },
    {
      contrato: antigos[4],
      titulo: 'Indicação: edifício vizinho',
      origem: 'indicacao',
      etapa: 'prospeccao',
      valorMensal: 1_890,
      proximaAcao: '',
    },
    {
      contrato: antigos[5],
      titulo: 'Indicação: contrato com peças',
      origem: 'indicacao',
      etapa: 'ganho',
      valorMensal: 2_450,
      proximaAcao: '',
    },
  ]

  const deslocamentos = [-2, 0, 1, 3, -1, 5, 2, 7, 0, 4]
  let propostas = 0
  return moldes.map((m, i) => {
    const eProposta = m.etapa === 'proposta'
    const orcamentoEnviadoEm = eProposta ? somarDias(hoje, -[3, 5, 1, 8][propostas++ % 4]) : undefined
    return {
      id: `oport-${i + 1}`,
      clienteId: m.contrato.clienteId,
      titulo: m.titulo,
      origem: m.origem,
      valorMensal: m.valorMensal,
      valorUnico: m.valorUnico,
      etapa: m.etapa,
      responsavel: RESPONSAVEIS[i % RESPONSAVEIS.length],
      proximaAcao: m.proximaAcao || ACAO_POR_ETAPA[m.etapa],
      dataProximaAcao: somarDias(hoje, deslocamentos[i % deslocamentos.length]),
      criadoEm: somarDias(hoje, -(6 + i * 3)),
      motivoPerda: m.motivoPerda,
      orcamentoEnviadoEm,
    }
  })
}

export function gerarEstado(hoje = hojeISO()): Estado {
  const s = criarSorteio(20261108)
  const total = 45

  const status = s.embaralhar<StatusContrato>([
    ...repetir<StatusContrato>('ativo', 32),
    ...repetir<StatusContrato>('vencendo', 5),
    ...repetir<StatusContrato>('vencido', 3),
    ...repetir<StatusContrato>('perdido', 5),
  ])

  // Origem calibrada pelo histórico: 45% renovação, 40% novo, 10% indicação, 5% licitação.
  const indices = status.map((_, i) => i)
  const vigentes = s.embaralhar(indices.filter((i) => status[i] === 'ativo' || status[i] === 'vencendo'))
  const origens = new Array<Origem>(total)
  vigentes.slice(0, 20).forEach((i) => (origens[i] = 'renovacao'))
  const demais = s.embaralhar([...vigentes.slice(20), ...indices.filter((i) => status[i] === 'vencido' || status[i] === 'perdido')])
  const distribuicao: Origem[] = [...repetir<Origem>('novo', 18), ...repetir<Origem>('indicacao', 5), ...repetir<Origem>('licitacao', 2)]
  demais.forEach((i, pos) => (origens[i] = distribuicao[pos]))

  // Tipo de cliente: cerca de 65% residencial e 35% comercial, como no histórico real.
  const tipos = new Array<TipoCliente>(total)
  const semLicitacao = s.embaralhar(indices.filter((i) => origens[i] !== 'licitacao'))
  indices.filter((i) => origens[i] === 'licitacao').forEach((i) => (tipos[i] = 'publico'))
  const distribuicaoTipo: TipoCliente[] = [...repetir<TipoCliente>('residencial', 29), ...repetir<TipoCliente>('comercial', 13), 'misto']
  semLicitacao.forEach((i, pos) => (tipos[i] = distribuicaoTipo[pos]))

  const cidades = s.embaralhar([
    ...repetir('Goiânia', 32),
    ...repetir('Aparecida de Goiânia', 4),
    ...repetir('Anápolis', 3),
    ...repetir('Trindade', 2),
    ...repetir('Senador Canedo', 2),
    ...repetir('Brasília', 2),
  ])

  const nomesResidenciais = [...NOMES_RESIDENCIAIS]
  const nomesComerciais = [...NOMES_COMERCIAIS]
  const nomesPublicos = [...NOMES_PUBLICOS]
  const nomePara = (tipo: TipoCliente) => {
    if (tipo === 'residencial') return nomesResidenciais.shift()!
    if (tipo === 'comercial') return nomesComerciais.shift()!
    if (tipo === 'publico') return nomesPublicos.shift()!
    return NOME_MISTO
  }

  // Dias até o vencimento: os valores 7, 30 e 60 garantem envios na fila de hoje.
  const diasVencendo = [7, 18, 30, 45, 60]
  const diasVencidos = [-12, -26, -41]
  const diasPerdidos = [-35, -88, -150, -214, -290]
  const motivos = ['preço', 'concorrente', 'atendimento', 'fechou prédio', 'preço']
  let cAtivo = 0
  let cVencendo = 0
  let cVencido = 0
  let cPerdido = 0

  const clientes: Cliente[] = []
  const contratos: Contrato[] = []

  indices.forEach((i) => {
    const id = String(i + 1).padStart(3, '0')
    const tipo = tipos[i]
    const cidade = cidades[i]
    const ddd = cidade === 'Brasília' ? '61' : '62'

    clientes.push({
      id: `cli-${id}`,
      nome: nomePara(tipo),
      tipo,
      bairro: s.item(BAIRROS[cidade]),
      cidade,
      sindico: `${s.item(PRENOMES)} ${s.item(SOBRENOMES)}`,
      // Prefixo 90000 não pertence a linhas reais: nenhum número aqui alcança uma pessoa.
      telefone: `(${ddd}) 90000-${String(s.entre(1000, 9999))}`,
      administradora: s.entre(0, 2) === 0 ? undefined : s.item(ADMINISTRADORAS),
    })

    const st = status[i]
    let dias: number
    if (st === 'vencendo') dias = diasVencendo[cVencendo++]
    else if (st === 'vencido') dias = diasVencidos[cVencido++]
    else if (st === 'perdido') dias = diasPerdidos[cPerdido++]
    else dias = 62 + cAtivo++ * 9 + s.entre(0, 6)

    const vencimento = somarDias(hoje, dias)
    const qtd = s.item([1, 1, 1, 2, 2, 2, 2, 3, 3, 4])
    const comPecas = s.entre(1, 100) <= 40
    const porElevador = s.entre(65, 125) * 10
    const valorMensal = Math.round(qtd * porElevador * (comPecas ? 1.35 : 1))

    contratos.push({
      id: `ctr-${id}`,
      clienteId: `cli-${id}`,
      qtdElevadores: qtd,
      marca: s.item(MARCAS),
      anoEquipamento: s.entre(1995, 2022),
      tipo: comPecas ? 'com_pecas' : 'sem_pecas',
      valorMensal,
      inicio: somarMeses(vencimento, -12),
      vencimento,
      status: st,
      origem: origens[i],
      motivoPerda: st === 'perdido' ? motivos[cPerdido - 1] : undefined,
      ultimoServico: st === 'ativo' || st === 'vencendo' ? somarDias(hoje, -s.entre(5, 40)) : undefined,
    })
  })

  // Dois contratos com visita há 2 dias, para o gatilho de pesquisa de satisfação aparecer na fila.
  contratos.filter((c) => c.status === 'ativo').slice(0, 2).forEach((c) => (c.ultimoServico = somarDias(hoje, -2)))

  return {
    versao: VERSAO_DADOS,
    ancora: hoje,
    config: {
      empresa: CONFIG.empresa,
      responsavel: CONFIG.responsavel,
      metaRenovacao: CONFIG.metaRenovacao,
      metaNovosMes: CONFIG.metaNovosMes,
    },
    clientes,
    contratos,
    oportunidades: gerarOportunidades(contratos, hoje),
    segmentos: gerarSegmentos(),
    editais: gerarEditais(hoje),
    filaStatus: {},
    checklist: {},
  }
}
