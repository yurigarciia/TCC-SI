import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-2">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Início</h1>
      <p className="max-w-md text-muted-foreground">
        Painel de gestão de associados, mensalidades e eventos. As telas de cada módulo chegam nos
        próximos tickets (T-FE-003 em diante).
      </p>
      <Button variant="outline" render={<Link href="/dev/design-system" />}>
        Ver design system
      </Button>
    </div>
  );
}
