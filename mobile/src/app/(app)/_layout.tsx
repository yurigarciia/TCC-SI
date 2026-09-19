import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { paperTheme } from "@/theme/paper-theme";
import { useRegistrarPushToken } from "@/features/notificacoes/use-notificacoes";

// Navbar inferior flutuante — prioridade pedida sobre navegação em drawer/hambúrguer.
export default function AppLayout() {
  // T-MOB-005 — pede permissão de notificação e registra o push token uma vez, assim que o
  // associado entra na área autenticada (best-effort, nunca bloqueia a navegação).
  useRegistrarPushToken();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: paperTheme.colors.primary,
        tabBarInactiveTintColor: "#9A8F80",
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          height: 64,
          borderRadius: 24,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#2B241D",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
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
        name="reservas"
        options={{
          title: "Reservas",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="ticket-confirmation-outline" color={color} size={size} />
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
    </Tabs>
  );
}
