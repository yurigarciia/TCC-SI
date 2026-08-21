# Mobile — App do Associado (Pia do Sul)

App React Native + Expo para o associado (consulta de mensalidade, reservas, ingressos). Ver
`TCC-FINAL/aplicacoes/mobile/PLANEJAMENTO.md` para o planejamento completo.

## Rodando localmente

```bash
npm install
npx expo start
```

Abre o Expo Dev Tools; escaneie o QR code com o app Expo Go (Android/iOS) ou rode em um emulador.
Depende da API do backend rodando em paralelo (ver `../backend/README.md`); configure a URL da API
em `app.config.ts`/variável de ambiente `EXPO_PUBLIC_API_URL`.

## Antes de codar

Este projeto foi gerado pelo `create-expo-app` mais recente — a versão do Expo pode ter mudado em
relação ao que já foi visto antes. Ver `AGENTS.md` desta pasta (aponta para a documentação
versionada do Expo) antes de usar APIs de navegação/notificações.

## Convenções deste projeto

- Reaproveita os tokens de cor e princípios de acessibilidade de
  `../TCC-FINAL/aplicacoes/frontend-web/DESIGN-SYSTEM.md` (mesma paleta, alvo de toque mínimo
  44×44px, confirmação explícita em ações irreversíveis).
- Token de sessão em `expo-secure-store`, nunca `AsyncStorage` puro.
- React Query para todo estado de servidor, mesma convenção do painel web.
