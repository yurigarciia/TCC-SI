import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-token";

// Guarda de rota no nível de proxy (renomeado de "middleware" no Next.js 16) — evita o "flash" de
// tela protegida antes do redirect, já que roda no servidor antes de qualquer render. Só checa a
// presença do cookie (não valida a assinatura/expiração do JWT aqui — isso é responsabilidade da
// API a cada chamada; um token expirado simplesmente resulta em 401 nas queries do React Query,
// tratado no client).
export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";

  if (!token && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // "brand" (public/brand/*) — achado ao usar a logo real na tela de login: como ela é
  // renderizada sem cookie (é a própria tela pública), a imagem estática precisa ficar de fora
  // do guard também, senão o pedido do <img> é redirecionado pra /login e volta HTML em vez de
  // PNG.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png|dev|brand).*)"],
};
