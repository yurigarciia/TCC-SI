// Marca do Querência ERP — arco cor de âmbar (sol/horizonte) sobre um "Q" em anel, remetendo à
// campanha gaúcha. Cores fixas da identidade (não seguem o tema claro/escuro): mesmos tokens de
// --secondary (verde-bandeira) e --warning (prata-âmbar) do design system, então já bate com o
// resto da interface sem introduzir uma paleta nova. Espelha src/app/icon.svg (usado como
// favicon) — mudanças aqui devem ser replicadas lá.
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Querência ERP"
    >
      <rect width="48" height="48" rx="11" fill="#2e5e3e" />
      <path
        d="M14 21 A10 10 0 0 1 34 21"
        fill="none"
        stroke="#b7791f"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="23.5" cy="28.5" r="9" fill="none" stroke="#faf7f1" strokeWidth="4.5" />
      <path d="M26.3 31.3 L32.7 37.7" fill="none" stroke="#faf7f1" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}
