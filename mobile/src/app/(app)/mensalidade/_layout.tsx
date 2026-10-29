import { Stack } from "expo-router";

// Sub-navegação da aba Mensalidade (resumo/histórico → gateway de pagamento simulado), mesmo
// padrão de (app)/eventos/_layout.tsx e (app)/ingressos/_layout.tsx: header nativo desligado, as
// telas usam <AppTopBar>. A navbar inferior flutuante de (app)/_layout.tsx continua visível.
export default function MensalidadeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="pagar" />
    </Stack>
  );
}
