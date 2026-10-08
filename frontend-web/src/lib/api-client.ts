import { getAuthToken } from "./auth-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
}

// Chamado pelo AppShell (único lugar sempre montado enquanto o admin está logado) pra reagir a
// um 401 numa chamada autenticada: sem isso, o cookie expirado/inválido ficava parado e cada
// query do React Query falhava sozinha, sem levar de volta pro /login (achado junto com o mesmo
// problema no app mobile — ver mobile/src/lib/api-client.ts).
let handler401: (() => void) | null = null;
export function registrarHandler401(handler: (() => void) | null): void {
  handler401 = handler;
}

// Wrapper fino sobre fetch — toda chamada à API do painel passa por aqui (nunca fetch direto em
// componente, ver README/DESIGN-SYSTEM), anexando o token quando `auth` não é explicitamente
// desativado (rotas públicas como o login).
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Content-Type", "application/json");
  if (auth) {
    const token = getAuthToken();
    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders });

  if (!response.ok) {
    if (auth && response.status === 401) {
      handler401?.();
    }
    const corpo = await response.json().catch(() => null);
    const mensagem =
      (corpo && typeof corpo === "object" && "message" in corpo
        ? String((corpo as { message: unknown }).message)
        : undefined) ?? `Erro ${response.status} ao chamar ${path}`;
    throw new ApiError(response.status, mensagem);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
