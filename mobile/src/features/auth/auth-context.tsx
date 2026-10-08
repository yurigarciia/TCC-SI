import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth-token";
import { registrarHandler401 } from "@/lib/api-client";

interface AuthContextValue {
  isAuthenticated: boolean;
  /** true enquanto ainda não sabemos se há um token salvo (leitura inicial do SecureStore). */
  isLoading: boolean;
  entrar: (token: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Fonte única de verdade de "está autenticado?" pro app inteiro — o layout raiz usa
// `isAuthenticated` no `Stack.Protected` pra decidir entre o grupo (auth) e o grupo (app), mesmo
// papel que o `src/proxy.ts` cumpre no painel web (mas aqui não tem middleware, é tudo client-side).
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAuthToken().then((token) => {
      setIsAuthenticated(!!token);
      setIsLoading(false);
    });
  }, []);

  const entrar = async (token: string) => {
    await setAuthToken(token);
    setIsAuthenticated(true);
  };

  const sair = useCallback(async () => {
    await clearAuthToken();
    setIsAuthenticated(false);
  }, []);

  // Registra o handler de 401 do api-client uma única vez — qualquer chamada autenticada que
  // voltar 401 (token expirado, revogado, ou storage de uma instalação antiga) derruba a sessão
  // de verdade em vez de deixar o app "logado" com um token morto.
  useEffect(() => {
    registrarHandler401(() => {
      void sair();
    });
    return () => registrarHandler401(null);
  }, [sair]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
  }
  return context;
}
