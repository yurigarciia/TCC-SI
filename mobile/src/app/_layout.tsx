import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/features/auth/auth-context";
import { QueryProvider } from "@/lib/query-provider";
import { paperTheme } from "@/theme/paper-theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <PaperProvider
          theme={paperTheme}
          settings={{ icon: (props) => <MaterialCommunityIcons {...props} /> }}
        >
          <StatusBar style="dark" />
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </PaperProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

// Guarda de rota client-side (não há middleware no Expo Router) — mesmo papel do src/proxy.ts no
// painel web. `Stack.Protected` troca automaticamente de grupo assim que `isAuthenticated` muda,
// sem precisar de redirect manual.
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: paperTheme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
