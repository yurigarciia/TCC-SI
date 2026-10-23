import { Stack } from "expo-router";

// Sub-navegação do detalhe do evento (detalhe → comprar ingresso/reservar mesa), mesmo padrão de
// (app)/eventos/_layout.tsx: header nativo desligado, cada tela usa <AppTopBar>. Reserva de mesa
// e compra de ingresso avulso vivem na MESMA tela de destino (comprar.tsx, com SegmentedButtons
// quando o evento tem as duas opções) — achado numa conversa com o usuário: são a mesma decisão
// de compra, não duas jornadas separadas.
export default function EventoDetalheLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="comprar" />
    </Stack>
  );
}
