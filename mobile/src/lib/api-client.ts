import { getAuthToken } from "./auth-token";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

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

// Chamado pelo AuthProvider (ver features/auth/auth-context.tsx) pra reagir a um 401 numa
// chamada autenticada: sem isso, o token expirado/inválido ficava guardado e o app continuava
// "logado" na aparência, só falhando tela por tela — achado investigando sessão que "caía"
// sozinha depois de alguns dias (JWT_EXPIRES_IN longo no MVP reduz a chance, mas não zera: token
// revogado, reinstalado com storage velho, etc. ainda passam por aqui).
let handler401: (() => void) | null = null;
export function registrarHandler401(handler: (() => void) | null): void {
  handler401 = handler;
}

// Espelha src/lib/api-client.ts do frontend-web (mesmo contrato de erro) — único ponto que deve
// chamar fetch contra a API, todo hook de domínio passa por aqui.
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Content-Type", "application/json");
  if (auth) {
    const token = await getAuthToken();
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
