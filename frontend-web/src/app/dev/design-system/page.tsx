import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const paleta = [
  { nome: "Pergaminho", token: "background", classe: "bg-background border" },
  { nome: "Grafite-couro", token: "foreground", classe: "bg-foreground" },
  { nome: "Vinho-lenço", token: "primary", classe: "bg-primary" },
  { nome: "Verde-bandeira", token: "secondary", classe: "bg-secondary" },
  { nome: "Couro claro", token: "accent", classe: "bg-accent" },
  { nome: "Areia", token: "muted", classe: "bg-muted" },
  { nome: "Couro-linha", token: "border", classe: "bg-border" },
  { nome: "Vermelho-alerta", token: "destructive", classe: "bg-destructive" },
  { nome: "Verde-sucesso", token: "success", classe: "bg-success" },
  { nome: "Prata-âmbar", token: "warning", classe: "bg-warning" },
  { nome: "Prata-pilcha", token: "silver", classe: "bg-silver" },
];

const associadosExemplo = [
  { nome: "Maria Fagundes", categoria: "Contribuinte", status: "em-dia" as const },
  { nome: "João Pedroso", categoria: "Patrimonial", status: "pendente" as const },
  { nome: "Ana Terra", categoria: "Contribuinte", status: "inadimplente" as const },
];

function BadgeStatus({ status }: { status: "em-dia" | "pendente" | "inadimplente" }) {
  if (status === "em-dia") return <Badge variant="success">Em dia</Badge>;
  if (status === "pendente") return <Badge variant="warning">Pendente</Badge>;
  return <Badge variant="destructive">Inadimplente</Badge>;
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Pampa Gestão — Painel Administrativo
        </p>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Design System
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Showcase dos tokens e componentes base (shadcn/ui) definidos em{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
            TCC-FINAL/aplicacoes/frontend-web/DESIGN-SYSTEM.md
          </code>
          . Paleta tradicionalista gaúcha aplicada como acento sobre um fundo claro — nunca como
          grandes blocos de cor saturada.
        </p>
      </header>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Paleta de cores</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {paleta.map((cor) => (
            <div key={cor.token} className="space-y-2">
              <div className={`h-16 rounded-lg ${cor.classe}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{cor.nome}</p>
                <p className="text-xs text-muted-foreground">--{cor.token}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Tipografia</h2>
        <div className="space-y-3">
          <p className="font-heading text-3xl font-semibold">Título de tela (Fraunces)</p>
          <p className="font-heading text-2xl font-semibold">Subtítulo de seção (Fraunces)</p>
          <p className="text-base">
            Texto de corpo padrão (Inter, 16px) — usado em formulários, tabelas e a maior parte da
            interface do painel.
          </p>
          <p className="text-sm text-muted-foreground">
            Texto de apoio / legenda (Inter, 14px) — tamanho mínimo usado em qualquer texto lido
            pelo usuário final.
          </p>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Botões</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Ação primária</Button>
          <Button variant="secondary">Ação secundária</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="ghost">Discreto</Button>
          <Button variant="destructive">Destrutiva</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Badges de status (semânticos)
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <BadgeStatus status="em-dia" />
          <BadgeStatus status="pendente" />
          <BadgeStatus status="inadimplente" />
          <Badge variant="secondary">Rascunho</Badge>
          <Badge variant="outline">Neutro</Badge>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Formulário</h2>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Cadastrar associado</CardTitle>
            <CardDescription>Campos com rótulo sempre visível — nunca só placeholder.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" placeholder="Ex.: Maria Fagundes" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" placeholder="000.000.000-00" />
            </div>
            <Button className="w-full">Salvar</Button>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Tabela</h2>
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Associado</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {associadosExemplo.map((associado, indice) => (
                <TableRow
                  key={associado.nome}
                  className={indice % 2 === 1 ? "bg-muted/50" : undefined}
                >
                  <TableCell className="flex items-center gap-2 font-medium">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-xs">
                        {associado.nome
                          .split(" ")
                          .map((parte) => parte[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {associado.nome}
                  </TableCell>
                  <TableCell>{associado.categoria}</TableCell>
                  <TableCell>
                    <BadgeStatus status={associado.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Abas</h2>
        <Tabs defaultValue="dados" className="max-w-md">
          <TabsList>
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="dependentes">Dependentes</TabsTrigger>
            <TabsTrigger value="mensalidades">Mensalidades</TabsTrigger>
          </TabsList>
          <TabsContent value="dados" className="text-sm text-muted-foreground">
            Dados cadastrais do associado.
          </TabsContent>
          <TabsContent value="dependentes" className="text-sm text-muted-foreground">
            Lista de dependentes vinculados.
          </TabsContent>
          <TabsContent value="mensalidades" className="text-sm text-muted-foreground">
            Histórico de mensalidades.
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Diálogos e confirmação de ação destrutiva
        </h2>
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>Ver detalhes</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detalhes da reserva</DialogTitle>
                <DialogDescription>
                  Exemplo de diálogo informativo, sem ação destrutiva.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive" />}>
              Suspender associado
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar suspensão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ações destrutivas ou de alto impacto sempre pedem confirmação explícita — nunca
                  um clique só.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction>Confirmar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </main>
  );
}
