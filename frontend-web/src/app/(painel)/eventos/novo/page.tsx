"use client";

import { EventoFormulario } from "@/features/eventos/evento-formulario";

export default function NovoEventoPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Novo evento</h1>
        <p className="text-sm text-muted-foreground">
          Dados básicos, ingresso e mesas — tudo nesta tela.
        </p>
      </div>

      <EventoFormulario modo="criar" />
    </div>
  );
}
