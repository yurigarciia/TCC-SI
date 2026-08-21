const COOKIE_NAME = "pia_do_sul_token";

// Cookie legível por JS (não httpOnly) — escolha deliberada, não descuido: o painel chama a API
// NestJS diretamente do navegador (sem camada de BFF no meio, ver CLAUDE.md), então o próprio
// código do cliente precisa ler o token para montar o header Authorization em cada requisição do
// React Query. Aceitável para o MVP (painel interno da diretoria, não uma superfície pública de
// pagamento); revisitar se o escopo crescer para exigir hardening adicional contra XSS.
export function setAuthToken(token: string): void {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = [
    `${COOKIE_NAME}=${token}`,
    "path=/",
    "max-age=86400",
    "SameSite=Lax",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const encontrado = document.cookie
    .split("; ")
    .find((linha) => linha.startsWith(`${COOKIE_NAME}=`));
  return encontrado ? encontrado.slice(COOKIE_NAME.length + 1) : null;
}

export function clearAuthToken(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
