import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { registrarParaPushNotifications } from "./register-push-token";

function useRegistrarPushTokenNoBackend() {
  return useMutation({
    mutationFn: (token: string) =>
      apiFetch("/notificacoes/push-token", {
        method: "POST",
        body: JSON.stringify({ token }),
      }),
  });
}

// Chamado uma vez, assim que o associado entra na área autenticada (ver (app)/_layout.tsx) —
// pede permissão de notificação e registra o token no backend. Silencioso de propósito: negar
// permissão ou não conseguir gerar o token (sem projectId de EAS, sem device físico) não deve
// gerar nenhum erro visível pro associado, é só uma tentativa em segundo plano.
export function useRegistrarPushToken() {
  const jaTentou = useRef(false);
  const registrar = useRegistrarPushTokenNoBackend();

  useEffect(() => {
    if (jaTentou.current) {
      return;
    }
    jaTentou.current = true;

    registrarParaPushNotifications()
      .then((token) => {
        if (token) {
          registrar.mutate(token);
        }
      })
      .catch(() => {
        // best-effort — nunca interrompe o uso do app
      });
    // `jaTentou` garante execução única mesmo que o efeito rode de novo por causa da identidade
    // instável de `registrar` (objeto novo do useMutation a cada render).
  }, [registrar]);
}
