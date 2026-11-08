# CRM Comercial de Manutenção de Elevadores

Demonstração de um CRM web para empresas de manutenção de elevadores: carteira de contratos, vencimentos, funil de vendas, régua de WhatsApp, licitações e relatório para a diretoria.

Os dados de clientes são **fictícios**. A tela "Meu histórico" usa resultados reais apenas **agregados**, sem nenhum dado de cliente. O app é 100% estático: sem login, sem backend e sem serviços pagos.

## Como instalar

É preciso ter o [Node.js](https://nodejs.org) instalado. Dentro da pasta do projeto, rode:

```bash
npm install
```

## Como rodar

```bash
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

Para gerar a versão final:

```bash
npm run build
```

## Como restaurar os dados

Menu **Configurações** → botão **Restaurar dados de demonstração**.

As alterações ficam salvas apenas no navegador em uso. As datas fictícias acompanham o calendário, então a demonstração abre completa em qualquer dia.

O nome da empresa, o nome do responsável comercial e as metas também são alterados em **Configurações**. O nome padrão da empresa fica em `src/config.ts`.

## Roteiro da demonstração

0. **Meu histórico (30 s, abertura):** "Antes do sistema, meus números: 611 contratos em 18 meses, metade novos. Esse CRM é como eu trabalho."
1. **Painel (1 min):** "Aqui a diretoria vê a receita recorrente, quanto está em risco nos próximos 60 dias e a taxa de renovação."
2. **Carteira (30 s):** filtrar "vencendo": "Estes são os contratos que eu ataco primeiro."
3. **Régua (1 min 30 s):** abrir a prévia de um cliente vencendo: "Isso sai automático pelo WhatsApp, 60, 30 e 7 dias antes. Posso cadastrar qualquer segmento: modernização, escadas rolantes, construtoras."
4. **Funil (1 min):** arrastar um card de Proposta para Negociação.
5. **Licitações (30 s):** "A Linos é ME: estes editais são exclusivos para ela, com menos concorrência."
6. **Relatório (30 s):** "Todo mês a diretoria recebe isto em PDF."

## Publicação na Vercel

1. Acessar vercel.com → "Continue with GitHub".
2. "Add New… → Project" → importar `crm-elevadores`.
3. Framework: Vite (detecta sozinho). Clicar em **Deploy**.
4. Abrir o link gerado no Safari do iPhone → Compartilhar → "Adicionar à Tela de Início".

A cada novo push, a Vercel atualiza o link sozinha.

## Tecnologias

Vite, React 18, TypeScript, Tailwind CSS, Recharts, dnd-kit, lucide-react e Papaparse.
