import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoMark } from "@/components/logo-mark";
import { cores } from "@/theme/paper-theme";

// Barra de topo compartilhada por toda a área autenticada — mesma marca/título em todas as telas
// (raiz de aba OU sub-tela empilhada), pra não ter cada tela com um estilo de cabeçalho diferente
// (achado numa conversa com o usuário). Sub-tela empilhada (ex.: detalhe de evento, aberta a
// partir da aba Eventos): passa `onVoltar` e mostra o botão de voltar.
//
// Achado numa conversa com o usuário: o botão "Sair" não deveria ficar de fácil acesso aqui (uma
// ação irreversível a um toque, no cabeçalho de toda tela) — ele já vive, com confirmação visual
// de contexto, no rodapé da aba Perfil (ver (app)/perfil.tsx). Removido daqui de propósito, não
// por esquecimento.
//
// Mesma cor de fundo da navbar inferior (cores.sidebar) — uma tentativa anterior usou um verde
// claro + anel dourado na logo, e o resultado ficou destoando de tudo (achado numa conversa com o
// usuário: "ficou ridículo"). Agora o próprio componente absorve o inset do topo (em vez da tela
// reservar `edges={["top"]}` no SafeAreaView) e pinta até atrás da barra de notificações com a
// mesma cor — ver (app)/_layout.tsx pro StatusBar correspondente.
export function AppTopBar({
  titulo,
  onVoltar,
}: {
  titulo: string;
  onVoltar?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.fundo, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        {onVoltar && (
          <IconButton
            icon="arrow-left"
            iconColor={cores.sidebarTexto}
            onPress={onVoltar}
            accessibilityLabel="Voltar"
            style={styles.botaoVoltar}
          />
        )}
        <View style={styles.logoChip}>
          <LogoMark size={18} />
        </View>
        <View style={styles.textos}>
          <Text variant="labelSmall" style={styles.marca}>
            QUERÊNCIA ASSOCIADOS
          </Text>
          <Text variant="titleMedium" style={styles.titulo}>
            {titulo}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: { backgroundColor: cores.sidebar },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  botaoVoltar: { margin: 0, marginRight: -4 },
  // Chip claro atrás da logo — mesma regra de contraste do logo-mark.tsx (o traço verde-escuro do
  // anel precisa de um fundo claro opaco por baixo, nunca um bloco escuro direto).
  logoChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FDF8F3",
    alignItems: "center",
    justifyContent: "center",
  },
  textos: { flex: 1 },
  marca: { color: cores.sidebarAtivo, fontWeight: "700", letterSpacing: 0.6 },
  titulo: { color: cores.sidebarTexto, fontWeight: "700" },
});
