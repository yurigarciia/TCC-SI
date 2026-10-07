"use client";

import { Calendar } from "lucide-react";

import { Breadcrumb } from "@/components/breadcrumb";
import { EventoFormulario } from "@/features/eventos/evento-formulario";

export default function NovoEventoPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Breadcrumb items={[{ label: "Eventos", href: "/eventos" }, { label: "Novo evento" }]} />
        <h1 className="font-heading text-2xl font-semibold text-foreground"><Calendar aria-hidden="true" className="mr-2 inline size-6 align-[-0.2em]" />Novo evento</h1>
      </div>

      <EventoFormulario modo="criar" />
    </div>
  );
}
