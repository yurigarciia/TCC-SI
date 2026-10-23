import { Stack } from "expo-router";

// Sub-navegação da aba Eventos (lista → detalhe). Header nativo do Stack desligado — as duas
// telas usam o mesmo <AppTopBar> das demais abas (achado numa conversa com o usuário: cada tela
// tinha um estilo de cabeçalho diferente); a tela de detalhe passa `onVoltar` pro AppTopBar em
// vez de depender do botão de voltar padrão do Stack. A navbar inferior flutuante de
// (app)/_layout.tsx continua visível nas duas telas.
export default function EventosLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
