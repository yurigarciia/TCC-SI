# Mobile — App do Associado (Pia do Sul)

App React Native + Expo para o associado (consulta de mensalidade, reservas, ingressos). Ver
`TCC-FINAL/aplicacoes/mobile/PLANEJAMENTO.md` para o planejamento completo.

## Rodando localmente

```bash
cp .env.example .env.local
npm install
npx expo start
```

Abre o Expo Dev Tools; escaneie o QR code com o app Expo Go (Android/iOS) ou rode em um emulador.
`npx expo start --web` também funciona (via `react-native-web`) — útil pra preview rápido, mas
**não é uma plataforma alvo** deste app (só Android/iOS, ver `PLANEJAMENTO.md` §2).

Depende da API do backend rodando em paralelo (ver `../backend/README.md`). URL configurada em
`.env.local` (`EXPO_PUBLIC_API_URL`, ver `.env.example`) — em device/emulador físico, `localhost`
não alcança a máquina de dev: use o IP da rede local da máquina, ou `10.0.2.2` no emulador Android.

## Antes de codar

Este projeto foi gerado pelo `create-expo-app` mais recente — a versão do Expo pode ter mudado em
relação ao que já foi visto antes. Ver `AGENTS.md` desta pasta (aponta para a documentação
versionada do Expo) antes de usar APIs de navegação/notificações.

## Telas implementadas

- `/(auth)` (index=login, `cadastro`, `vincular-conta`) e `/(app)` (index=início/status,
  `mensalidade`, `reservas`=Minhas Reservas, `eventos`=lista+detalhe) — RF01 (canal associado),
  status do associado (RF03), RF05/RF06/RF08, RF11/RF12/RF13/RF14. `Stack.Protected` no layout raiz
  (`src/app/_layout.tsx`) troca
  automaticamente entre os dois grupos conforme `AuthProvider.isAuthenticated`
  (`src/features/auth/auth-context.tsx`) — sem middleware, é tudo client-side (`getAuthToken()`
  lido do `expo-secure-store` uma vez no mount). Cadastro (`/(auth)/cadastro`, auto-cadastro RF01)
  e vincular-conta (`/(auth)/vincular-conta`, T-BE-014 — associado com cadastro mediado pela
  diretoria cria a própria senha) logam automaticamente após o sucesso (chamam `/auth/login` na
  sequência), então o associado já cai direto na tela de início. Tela de início mostra
  nome/CPF/status (`StatusAssociadoBadge`) + card de aviso quando "Pendente de validação" ou
  "Rejeitado". Mensalidade (`(app)/mensalidade.tsx`, T-MOB-002) mostra a mensalidade mais antiga
  ainda não paga em destaque (não a mais recente — evita esconder um atraso antigo) com botão
  "Pagar online" (`GET/POST /mensalidades/minhas/*`, endpoints novos com checagem de posse — ver
  T-MOB-002 no `PLANEJAMENTO-GERAL.md`), card "Você está em dia!" quando não há pendência, e
  histórico completo com `StatusMensalidadeBadge`. Minhas Reservas (`(app)/reservas.tsx`) lista as
  reservas de mesa do associado (`GET /reservas/minhas`, já enriquecido com nome do evento e
  número da mesa — ver T-BE-012 no `PLANEJAMENTO-GERAL.md`), com estado vazio e retry em erro.
  Eventos (`(app)/eventos/`, T-MOB-004) lista os eventos publicados (`index.tsx`, público) e abre
  um detalhe (`[id].tsx`, sub-`Stack` em `eventos/_layout.tsx`) com mapa de mesas ao vivo
  (`MapaMesasCanvas`, RF14) — toque numa mesa livre abre um `Dialog` pra escolher forma de
  pagamento e reservar (`POST .../reservar-minha`, RF11); mesa ocupada só mostra titular/status.
  Cartão de ingresso avulso com botão de compra (`POST .../meu-ingresso`, RF12, sempre sócio/app/
  online). Reserva e compra invalidam o mapa de mesas e Minhas Reservas via React Query, sem
  precisar de refresh manual.

## Convenções deste projeto

- Reaproveita os tokens de cor e princípios de acessibilidade de
  `../TCC-FINAL/aplicacoes/frontend-web/DESIGN-SYSTEM.md` (mesma paleta, alvo de toque mínimo
  44×44px, confirmação explícita em ações irreversíveis) — ver `src/theme/paper-theme.ts`.
- Componentes: **react-native-paper** (decisão fechada em T-MOB-001, ver Perguntas em Aberto do
  `PLANEJAMENTO.md`) com ícones via `@expo/vector-icons` (não `react-native-vector-icons` puro —
  este último exige linking de fonte nativa fora do fluxo gerenciado do Expo).
  `userInterfaceStyle: "light"` fixo no `app.json` — dark mode é Non Goal, mesma decisão do
  painel web.
- Token de sessão em `expo-secure-store`, nunca `AsyncStorage` puro — **exceto** no target web
  (`Platform.OS === "web"`), que cai pra `localStorage` porque o módulo nativo do SecureStore não
  existe nesse target (ver comentário em `src/lib/auth-token.ts`). Web não é alvo de distribuição,
  só serve pra preview — esse fallback nunca roda num build nativo real.
- React Query para todo estado de servidor, mesma convenção do painel web — hooks em
  `src/features/<dominio>/`, nunca `fetch` direto em componente (`src/lib/api-client.ts` é o único
  ponto que chama a API, mesmo contrato de erro do `apiFetch` do frontend-web).
- Navegação: **Expo Router** file-based, com `Stack.Protected` (`guard={boolean}`) pra rotas
  autenticadas — não usar `router.replace()` manual em `useEffect` pra isso, o `Protected` já faz
  a troca de grupo sozinho quando o estado de auth muda. Dentro de `(app)`, navegação é por
  **navbar inferior flutuante** (`Tabs` do Expo Router, `(app)/_layout.tsx` — `tabBarStyle` com
  `position: "absolute"`, cantos arredondados, sombra), não drawer/hambúrguer — decisão explícita
  do usuário. Toda nova aba (ex.: T-MOB-004) entra como `Tabs.Screen` aqui; telas dentro de
  `(app)` que usam `ScrollView` precisam de `paddingBottom` generoso (~110) no
  `contentContainerStyle` pra conteúdo não ficar embaixo da navbar flutuante.
- Formatação de moeda/data/competência sempre via `src/lib/format.ts`
  (`formatarMoeda`/`formatarData`/`formatarCompetencia`, espelhando `format.ts` do painel web) —
  não reimplementar `Intl.NumberFormat`/`toLocaleDateString` em cada tela.
- `AppTopBar` (`src/components/app-top-bar.tsx`) é compartilhado por toda tela de `(app)` — nome
  do app + título da tela + botão "Sair" sempre no mesmo lugar. Não recriar esse cabeçalho por
  tela.
- Ícones do `PaperProvider` precisam ser conectados explicitamente (`settings={{ icon: ... }}` no
  `src/app/_layout.tsx`, usando `@expo/vector-icons/MaterialCommunityIcons`) — sem isso, todo
  `icon="..."` de `Button`/`TextInput.Icon`/`Chip`/`Avatar.Icon` falha silenciosamente.
- Padrão visual das telas de auth (`(auth)/index.tsx`, `cadastro.tsx`, `vincular-conta.tsx`):
  `AuthHeader` (`src/components/auth-header.tsx`) — banner em gradiente vinho
  (`gradienteCabecalho` do tema) com ícone, título e subtítulo, cantos inferiores arredondados —
  seguido de um `Surface` branco arredondado (raio 20) com os campos, sobrepondo o banner
  (`marginTop: -20`) pra dar profundidade. Cabeçalho nativo do Stack sempre desligado
  (`headerShown: false` no `(auth)/_layout.tsx`) — a navegação de volta mora dentro do próprio
  `AuthHeader` (`mostrarVoltar`), não no header do sistema.
- Erro de mutation em formulário: sempre `ErrorSnackbar` (`src/components/error-snackbar.tsx`),
  nunca texto solto vermelho na tela — mensagem vem de `erro.message` quando `erro instanceof
  ApiError` (mensagem real do backend), com fallback genérico pra erro de rede/conexão. Erros de
  validação de campo (zod) continuam inline, abaixo do campo — só erro de *submissão* (API) usa
  Snackbar.
- Todo campo de formulário tem `placeholder` além do `label` (o label flutua quando preenchido; o
  placeholder aparece dentro do campo enquanto ele está focado e vazio) e um ícone à esquerda
  (`left={<TextInput.Icon icon="..." />}`) — nunca um `TextInput` "pelado" sem nenhum dos dois.
