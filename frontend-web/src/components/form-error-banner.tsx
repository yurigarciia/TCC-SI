import { AlertCircle } from "lucide-react";

// Achado numa conversa com o usuário: erro de salvar (CPF duplicado, falha de rede, validação
// rejeitada pelo backend) só aparecia no toast, que some sozinho em alguns segundos — sem nenhum
// lugar fixo na própria tela dizendo o que houve. Esse banner fica junto do formulário até o
// próximo envio, com a mensagem real retornada pela API (ver ApiError em lib/api-client.ts), não
// um texto genérico.
export function FormErrorBanner({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{mensagem}</span>
    </div>
  );
}
