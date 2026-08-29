import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// expo-secure-store (Keychain no iOS, EncryptedSharedPreferences no Android) — dado sensível,
// nunca AsyncStorage puro (ver PLANEJAMENTO.md §2). Diferente do painel web (cookie síncrono),
// aqui o acesso é sempre assíncrono.
//
// SecureStore não tem implementação no target web (o módulo nativo nem existe lá — ver
// node_modules/expo-secure-store/src/ExpoSecureStore.web.ts, que é só `{}`). Web não é uma
// plataforma alvo deste app (PLANEJAMENTO.md: Android/iOS via Expo Go/EAS), mas `expo start --web`
// continua útil pra preview/dev rápido — por isso o fallback para `localStorage` só nesse target,
// nunca usado em build nativo.
const CHAVE_TOKEN = "pia_do_sul_token";

export async function setAuthToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(CHAVE_TOKEN, token);
    return;
  }
  await SecureStore.setItemAsync(CHAVE_TOKEN, token);
}

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(CHAVE_TOKEN);
  }
  return SecureStore.getItemAsync(CHAVE_TOKEN);
}

export async function clearAuthToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(CHAVE_TOKEN);
    return;
  }
  await SecureStore.deleteItemAsync(CHAVE_TOKEN);
}
