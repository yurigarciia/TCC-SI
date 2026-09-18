import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { gradienteCabecalho } from "@/theme/paper-theme";
import { LogoMark } from "@/components/logo-mark";

interface AuthHeaderProps {
  titulo: string;
  subtitulo: string;
  icone?: keyof typeof MaterialCommunityIcons.glyphMap;
  // Tela de login (a "porta de entrada" do app) mostra a marca do Querência ERP em vez de um ícone
  // genérico — cadastro/vincular-conta seguem com ícones contextuais (icone acima).
  logo?: boolean;
  mostrarVoltar?: boolean;
}

// Cabeçalho em gradiente vinho compartilhado pelas 3 telas de autenticação — dá cor e identidade
// logo na entrada do app, em vez de um fundo pergaminho liso do topo ao fim da tela. Substitui o
// header nativo do Stack (headerShown: false no layout) — quando `mostrarVoltar`, o botão de
// voltar mora aqui dentro pra combinar com o gradiente.
export function AuthHeader({
  titulo,
  subtitulo,
  icone = "hand-wave",
  logo = false,
  mostrarVoltar = false,
}: AuthHeaderProps) {
  return (
    <LinearGradient colors={gradienteCabecalho} style={styles.container}>
      {mostrarVoltar && (
        <IconButton
          icon="arrow-left"
          iconColor="#FDF8F3"
          size={22}
          onPress={() => router.back()}
          style={styles.voltar}
        />
      )}
      <View style={[styles.iconCircle, logo && styles.iconCircleLogo]}>
        {logo ? (
          <LogoMark size={40} />
        ) : (
          <MaterialCommunityIcons name={icone} size={32} color="#FDF8F3" />
        )}
      </View>
      <Text variant="headlineMedium" style={styles.titulo}>
        {titulo}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitulo}>
        {subtitulo}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 64,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 4,
  },
  voltar: {
    position: "absolute",
    top: 52,
    left: 8,
    margin: 0,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(253, 248, 243, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  // Chip opaco pra logo real (não um ícone genérico) — o traço verde-escuro do anel perde
  // contraste no chip translúcido de cima, sobre o gradiente vinho.
  iconCircleLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FDF8F3",
  },
  titulo: {
    color: "#FDF8F3",
    fontWeight: "700",
  },
  subtitulo: {
    color: "rgba(253, 248, 243, 0.85)",
    textAlign: "center",
  },
});
