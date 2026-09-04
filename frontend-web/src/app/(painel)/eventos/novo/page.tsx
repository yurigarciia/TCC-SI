"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import { EventoFormulario } from "@/features/eventos/evento-formulario";

export default function NovoEventoPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-1">
        <Breadcrumb items={[{ label: "Eventos", href: "/eventos" }, { label: "Novo evento" }]} />
        <h1 className="font-heading text-2xl font-semibold text-foreground">Novo evento</h1>
      </div>

      <EventoFormulario modo="criar" />
    </div>
  );
}
