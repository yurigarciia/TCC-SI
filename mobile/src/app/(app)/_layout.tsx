import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { Dimensions } from "react-native";
import { cores } from "@/theme/paper-theme";
import { useRegistrarPushToken } from "@/features/notificacoes/use-notificacoes";

const MARGEM_HORIZONTAL = 16;
const LARGURA_TELA = Dimensions.get("window").width;

// Navbar inferior flutuante — prioridade pedida sobre navegação em drawer/hambúrguer. Verde da
// sidebar + âmbar no item ativo (mesma paleta do painel web, ver cores.sidebar/sidebarAtivo em
// theme/paper-theme.ts) — achado numa conversa com o usuário: era branca/monocromática, sem
// nenhuma identidade visual compartilhada com o resto do sistema. `width` explícita (em vez de só
// `left`/`right`) porque o React Navigation recalcula a largura da tab bar internamente e ignora
// left/right quando `position: "absolute"` — sem isso a barra ficava colada nas bordas da tela
// mesmo com left/right configurados.
export default function AppLayout() {
  // T-MOB-005 — pede permissão de notificação e registra o push token uma vez, assim que o
  // associado entra na área autenticada (best-effort, nunca bloqueia a navegação).
  useRegistrarPushToken();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.sidebarAtivo,
        tabBarInactiveTintColor: cores.sidebarTexto,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          position: "absolute",
          left: MARGEM_HORIZONTAL,
          bottom: 16,
          width: LARGURA_TELA - MARGEM_HORIZONTAL * 2,
          height: 64,
          borderRadius: 24,
          backgroundColor: cores.sidebar,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: cores.sidebarEscuro,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },
        tabBarItemStyle: { paddingTop: 8 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="mensalidade"
        options={{
          title: "Mensalidade",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="credit-card-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ingressos"
        options={{
          title: "Ingressos",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="qrcode" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="eventos"
        options={{
          title: "Eventos",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-star" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
