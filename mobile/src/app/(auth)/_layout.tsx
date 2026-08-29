import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="cadastro" options={{ headerShown: true, title: "Criar conta" }} />
      <Stack.Screen
        name="vincular-conta"
        options={{ headerShown: true, title: "Vincular conta" }}
      />
    </Stack>
  );
}
