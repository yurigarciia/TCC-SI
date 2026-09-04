"use client";

import { EventoFormulario } from "@/features/eventos/evento-formulario";

export default function NovoEventoPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Novo evento</h1>

      <EventoFormulario modo="criar" />
    </div>
  );
}
