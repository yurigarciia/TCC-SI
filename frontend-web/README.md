# Frontend Web — Painel Administrativo (Pia do Sul)

Painel administrativo em Next.js + Tailwind CSS + shadcn/ui. Ver
`TCC-FINAL/aplicacoes/frontend-web/PLANEJAMENTO.md` (planejamento) e
`TCC-FINAL/aplicacoes/frontend-web/DESIGN-SYSTEM.md` (tokens de cor, tipografia, componentes,
acessibilidade) antes de criar qualquer tela nova.

## Rodando localmente

```bash
cp .env.example .env.local
npm install
npm run dev
```

Disponível em `http://localhost:3010` (porta fixada em `package.json` — `3000` e `3001` colidem
com outros projetos comuns no ambiente de dev; ajuste se precisar). Depende da API do backend
rodando em paralelo em `:3000` (ver `../backend/README.md`); URL configurada em `.env.local`
(`NEXT_PUBLIC_API_URL`, ver `.env.example`).

## Antes de codar

Este projeto foi gerado pelo `create-next-app` mais recente — a versão do Next.js pode ter mudado
em relação ao que já foi visto antes. Ver `AGENTS.md` desta pasta (aponta para a documentação
versionada em `node_modules/next/dist/docs/`) antes de usar convenções de rota/data-fetching.

## Design System

`src/app/globals.css` implementa os tokens de `DESIGN-SYSTEM.md` como CSS custom properties
(shadcn/ui, estilo `base-nova` sobre `@base-ui/react` — componentes usam a prop `render`, não
`asChild`). Showcase de todos os componentes base em `/dev/design-system` — abrir essa página
antes de estilizar uma tela nova para ver o que já existe.

```bash
npx shadcn@latest add <componente>   # adicionar um novo componente shadcn/ui
```

## Autenticação

Login em `/login` chama `POST /auth/login` direto no backend (sem camada de BFF — ver
`CLAUDE.md`) e guarda o JWT num cookie legível por JS (`src/lib/auth-token.ts`; decisão deliberada,
documentada no arquivo — não httpOnly porque o cliente precisa montar o header `Authorization` em
cada chamada). `src/proxy.ts` (renomeado de `middleware.ts` no Next.js 16) guarda as rotas: sem
cookie redireciona para `/login`; com cookie, `/login` redireciona para `/`. `src/lib/api-client.ts`
é o único ponto que deve fazer `fetch` para a API — anexa o token automaticamente.

## Telas implementadas

- `/` — dashboard inicial com cartões de resumo (associados ativos, pendentes de validação,
  inadimplentes, eventos publicados) e lista dos próximos eventos publicados; cada cartão linka
  para a tela correspondente. Reaproveita os hooks já existentes de cada domínio, sem endpoint
  próprio.
- `/associados`, `/associados/novo`, `/associados/[id]` — cadastro mediado, aprovação/rejeição de
  cadastro pendente, dependentes (RF01–RF04). Usar como referência de padrão para as próximas
  telas: hooks em `src/features/<dominio>/`, formulário com react-hook-form + zod, badge de
  status semântico, ações destrutivas atrás de `AlertDialog`.
- `/mensalidades` — relatório de inadimplência + gatilho manual dos jobs de geração/inadimplência
  (RF05–RF08). Histórico de mensalidades de um associado específico fica embutido como card em
  `/associados/[id]` (`MensalidadesCard`), não em rota própria — mesmo padrão a seguir para dados
  que só fazem sentido no contexto de um associado (ex.: reservas, ingressos).
- `/saloes`, `/saloes/novo`, `/saloes/[id]` — croqui de salão reutilizável entre eventos, com
  mapa clicável de mesas (`MesaCanvas`) posicionadas por x/y (RF10). Sem imagem de planta baixa de
  fundo por enquanto — pendência em aberto do fluxo mapeado.
- `/eventos`, `/eventos/novo`, `/eventos/[id]` — cadastro de evento (nasce rascunho), vínculo
  opcional a um croqui de salão, configuração de preço/bloqueio por mesa e de ingresso avulso,
  publicação (RF09–RF11). O card de mesas só aparece quando o evento tem `salaoId`; a
  configuração de mesas é sempre um replace-all da lista inteira, igual ao contrato do backend.
- `/eventos/[id]/mapa` — mapa de mesas do evento (RF14/RF15), reaproveitando o plano cartesiano do
  `MesaCanvas` agora colorido por status (livre/pendente/reservada/bloqueada). Clicar numa mesa
  abre um `Dialog` com o painel de ação certo pro status: registrar reserva mediada, confirmar,
  cancelar, transferir titularidade ou transferir mesa. Sem polling — o estado só atualiza quando
  uma mutation local invalida a query ou a página é recarregada (ver Open Questions do
  PLANEJAMENTO-GERAL.md se polling/websocket entrar em escopo depois).
- `/eventos/[id]/ingressos` — venda presencial de ingresso avulso (sócio/não-sócio/criança) e
  check-in (RF11/RF12). "Leitura de QR" tem duas formas, coexistindo com a busca manual por nome e
  o botão de check-in por linha da tabela: câmera do navegador (`QrCodeScanner`, biblioteca
  `qr-scanner`, só liga sob clique explícito) e um campo de texto que também aceita um leitor
  USB/câmera externo que funciona como teclado (keyboard wedge) — útil se o hardware da sede não
  tiver câmera compatível ou a permissão for negada.

## Convenções deste projeto

- Nenhuma cor hardcoded fora dos tokens do `DESIGN-SYSTEM.md` (ver `/dev/design-system`).
- Toda chamada à API passa por `apiFetch` (`src/lib/api-client.ts`) dentro de um hook de React
  Query — nunca `fetch` direto em componente.
- Formatação de moeda/data sempre via `src/lib/format.ts` (`formatarMoeda`/`formatarData`) — não
  reimplementar `Intl.NumberFormat`/`toLocaleDateString` em cada tela.
- Pastas por domínio de negócio em `src/features/` (`auth/`, `associados/`, `mensalidades/`, e
  futuramente `eventos/`, `reservas/`), espelhando os módulos do backend.
- `Button` renderizado como link (`render={<Link .../>}`) já assume `nativeButton={false}`
  automaticamente — não precisa passar essa prop manualmente.
- Formulário com campo numérico via `z.coerce.number()`: tipar `useForm` com os três genéricos
  (`useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>`), senão o TypeScript
  reclama de incompatibilidade entre o tipo de entrada (string do input) e o de saída (number já
  coagido) do resolver. Ver `saloes/novo` ou `saloes/[id]` como referência.
- `Checkbox` do shadcn (`base-ui`) é controlado (`checked`/`onCheckedChange`), não aceita
  `register()` do react-hook-form — usar `Controller`, mesmo padrão já usado para o `Select`. Ver
  `eventos/[id]` como referência.
- `SelectValue` do base-ui **não** resolve sozinho o label do item selecionado — sem passar uma
  função `children` mapeando valor→label, ele mostra o valor bruto assim que algo é selecionado
  (um id/UUID cru, ou o enum em vez do rótulo em português). Sempre passar
  `<SelectValue>{(valor) => /* mapeia valor para o label certo, com fallback pro placeholder */}</SelectValue>`
  quando os `value`s dos `SelectItem` não forem, eles mesmos, o texto a exibir — o que cobre
  praticamente todo Select do projeto (ids de croqui/mesa/categoria, enums de perfil/forma de
  pagamento). Ver `eventos/[id]/ingressos` ou `eventos/[id]/mapa` como referência.
- **Flexbox e overflow horizontal:** `body` (`layout.tsx`) e o wrapper do `AppShell` são
  `flex flex-col`, então qualquer filho direto que precise encolher abaixo do seu conteúdo
  intrínseco (parágrafos longos, tabelas largas) precisa de `min-w-0` explícito — sem isso, um
  item flex se recusa a encolher (o famoso bug de `min-width: auto` do flexbox) e empurra a
  página inteira para rolagem horizontal. `main`, a linha `nav`+`main` e o wrapper raiz do
  `AppShell` já têm `min-w-0`; `body` também tem `overflow-x-hidden` como rede de segurança.
  Manter esse padrão em qualquer novo container flex de nível de página.
- Canvas de mapa (`MesaCanvas`, `MapaMesasCanvas`) tem tamanho sempre fixo (640×420) — as mesas
  usam `posicaoX`/`posicaoY` em pixels reais, não proporcionais, então encolher o canvas (ex.:
  `maxWidth: "100%"`) cortaria mesas fora da borda em telas estreitas. Em vez disso, o wrapper
  externo rola horizontalmente (`overflow-x-auto rounded-lg border`, mesmo padrão das tabelas) —
  nunca tente fazer esses canvas "responsivos" via CSS puro sem reescalar as coordenadas.
- Navegação mobile: `AppShell` mostra a sidebar normal a partir do breakpoint `sm` (640px); abaixo
  disso, um botão de hambúrguer no header abre um `Sheet` (drawer) com os mesmos links, que fecha
  sozinho ao navegar (`onNavigate` em `LinksDeNavegacao`). Qualquer novo item de navegação deve ir
  em `itensDeNavegacao` (`src/components/layout/app-shell.tsx`) — os dois menus leem da mesma
  lista, não duplicar.
