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

- `/(auth)` (index=login, `cadastro`, `vincular-conta`) e `/(app)` (index=início/status) — RF01
  (canal associado) e status do associado (RF03). `Stack.Protected` no layout raiz
  (`src/app/_layout.tsx`) troca automaticamente entre os dois grupos conforme
  `AuthProvider.isAuthenticated` (`src/features/auth/auth-context.tsx`) — sem middleware, é tudo
  client-side (`getAuthToken()` lido do `expo-secure-store` uma vez no mount). Cadastro
  (`/(auth)/cadastro`, auto-cadastro RF01) e vincular-conta (`/(auth)/vincular-conta`, T-BE-014 —
  associado com cadastro mediado pela diretoria cria a própria senha) logam automaticamente após
  o sucesso (chamam `/auth/login` na sequência), então o associado já cai direto na tela de
  início. Tela de início mostra nome/CPF/status (`StatusAssociadoBadge`) + card de aviso quando
  "Pendente de validação" ou "Rejeitado"; mensalidade/histórico fica pra T-MOB-002 (mensalidades
  hoje é 100% `@Roles(ADMINISTRADOR)` no backend, sem endpoint pro associado ainda).

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
  a troca de grupo sozinho quando o estado de auth muda.
