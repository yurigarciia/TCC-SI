import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { cores } from "@/theme/paper-theme";
import { useRegistrarPushToken } from "@/features/notificacoes/use-notificacoes";

const MARGEM_HORIZONTAL = 16;

// Navbar inferior flutuante — prioridade pedida sobre navegação em drawer/hambúrguer. Verde da
// sidebar + âmbar no item ativo (mesma paleta do painel web, ver cores.sidebar/sidebarAtivo em
// theme/paper-theme.ts) — achado numa conversa com o usuário: era branca/monocromática, sem
// nenhuma identidade visual compartilhada com o resto do sistema.
//
// `marginHorizontal` em vez de `left`/`right` — achado em duas rodadas de conversa: a barra
// continuava colada nas bordas (ou com margem assimétrica) com qualquer combinação de left/right
// ou width calculada via Dimensions. Causa real (lendo o fonte vendorizado em
// expo-router/build/react-navigation/bottom-tabs/views/BottomTabBar.js): o estilo base da barra
// usa `start: 0, end: 0` (propriedades lógicas, cientes de RTL), não `left`/`right` — como são
// chaves de estilo diferentes, definir `left`/`right` no tabBarStyle nunca sobrescrevia `start`/
// `end` (RN mescla objetos de estilo por nome de chave, não por efeito visual; as duas acabam
// coexistindo e o resultado de qual "vence" varia). `marginHorizontal` não tem esse conflito — é
// aplicado por cima da caixa já posicionada em start:0/end:0, então encolhe os dois lados por
// igual não importa o que a base use por baixo.
export default function AppLayout() {
  // T-MOB-005 — pede permissão de notificação e registra o push token uma vez, assim que o
  // associado entra na área autenticada (best-effort, nunca bloqueia a navegação).
  useRegistrarPushToken();

  return (
    <>
      {/* Ícones claros pra combinar com o fundo escuro do AppTopBar (achado numa conversa com o
          usuário: "ficou ridículo" o topo claro destoando do resto). Expo SDK 57 não aceita mais
          `backgroundColor` aqui (Android força edge-to-edge, a barra de notificações é sempre
          transparente) — por isso o próprio AppTopBar pinta atrás dela com `insets.top`, e é essa
          pintura, não esta prop, que faz a cor bater. */}
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: cores.sidebarAtivo,
          tabBarInactiveTintColor: cores.sidebarTexto,
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
          tabBarStyle: {
            position: "absolute",
            marginHorizontal: MARGEM_HORIZONTAL,
            bottom: 16,
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
              <MaterialCommunityIcons
                name="home-variant-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="mensalidade"
          options={{
            title: "Mensalidade",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="credit-card-outline"
                color={color}
                size={size}
              />
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
              <MaterialCommunityIcons
                name="calendar-star"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-circle-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
