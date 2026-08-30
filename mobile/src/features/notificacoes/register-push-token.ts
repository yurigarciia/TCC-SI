import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

// T-MOB-005 — lembrete de inadimplência e confirmações de reserva/compra chegam como push. Padrão
// oficial da doc do expo-notifications (v57): canal Android dedicado, permissão, depois o token.
//
// Sem projectId de EAS configurado neste app ainda (nenhum `eas.json`/`extra.eas.projectId` — ver
// PLANEJAMENTO-GERAL.md T-MOB-005: pendente de build/teste em device real), getExpoPushTokenAsync
// lança nesse caso. Isso é esperado neste momento do projeto — por isso todo o fluxo aqui é
// best-effort: nunca lança pra quem chama, só retorna null quando não dá pra registrar (usuário
// negou permissão, não é device físico, ou falta projectId).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registrarParaPushNotifications(): Promise<string | null> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#7A2331",
    });
  }

  const { status: statusAtual } = await Notifications.getPermissionsAsync();
  let statusFinal = statusAtual;
  if (statusAtual !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    statusFinal = status;
  }
  if (statusFinal !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    return null;
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch {
    return null;
  }
}
