import { cn } from "@/lib/utils";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

// Mesmo avatar de iniciais da listagem de associados (src/app/(painel)/associados/page.tsx),
// extraído pra componente reutilizável — passou a ser usado também na tela de conferência do
// check-in por QR. Sem foto de verdade ainda (não há upload de imagem no cadastro hoje).
export function AvatarIniciais({
  nome,
  tamanho = "size-11",
  className,
}: {
  nome: string;
  tamanho?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-sidebar-primary font-semibold text-sidebar-primary-foreground",
        tamanho,
        className,
      )}
    >
      {iniciais(nome)}
    </div>
  );
}
