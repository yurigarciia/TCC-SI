import Image from "next/image";

// Marca do Querência ERP — arte oficial (não é mais um desenho aproximado): recorte do ícone
// (o "Q" com sol/horizonte) a partir da logo vetorizada em public/brand/qerp-icon.png, fundo
// transparente. Usar sempre sobre fundo claro — sobre fundo escuro (sidebar, headers em vinho)
// o traço verde-escuro do anel perde contraste; nesses casos, envolver num chip claro opaco em
// vez de aplicar aqui.
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/qerp-icon.png"
      alt="Querência ERP"
      width={size}
      height={size}
      className={className}
      unoptimized
    />
  );
}
