import { Stack } from "expo-router";

// Sub-navegação da aba Eventos (lista → detalhe) — usa o header nativo do Stack aqui (diferente
// das telas de auth), já que é só título + botão de voltar padrão, sem precisar do banner em
// gradiente. A navbar inferior flutuante de (app)/_layout.tsx continua visível nas duas telas.
export default function EventosLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#7A2331" },
        headerTintColor: "#FDF8F3",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Eventos" }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
    </Stack>
  );
}
