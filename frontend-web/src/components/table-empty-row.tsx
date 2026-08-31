import type { ReactNode } from "react";
import { TableCell, TableRow } from "@/components/ui/table";

// Sem itens, a tabela some por completo e vira um textinho solto — daí não dá pra ver o
// cabeçalho/formatação sem já ter dados. Mantém a tabela inteira (cabeçalho, largura, zebra)
// sempre visível, com o aviso de "vazio" centralizado dentro do corpo, ocupando todas as colunas.
export function TableEmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className="h-32 text-center align-middle whitespace-normal text-muted-foreground"
      >
        {children}
      </TableCell>
    </TableRow>
  );
}
