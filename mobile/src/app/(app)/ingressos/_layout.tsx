import { Stack } from "expo-router";

// Sub-navegação da aba Ingressos (lista → detalhe), mesmo padrão de (app)/eventos/_layout.tsx:
// header nativo desligado, as duas telas usam <AppTopBar>. A navbar inferior flutuante de
// (app)/_layout.tsx continua visível nas duas telas.
export default function IngressosLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
