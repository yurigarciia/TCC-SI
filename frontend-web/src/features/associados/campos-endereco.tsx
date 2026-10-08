"use client";

import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buscarEnderecoPorCep } from "@/lib/cep";
import { formatarCep } from "@/lib/format";

export const enderecoSchema = z.object({
  cep: z.string().min(8, "CEP inválido."),
  logradouro: z.string().min(2, "Informe o logradouro."),
  numero: z.string().min(1, "Informe o número."),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Informe o bairro."),
  cidade: z.string().min(2, "Informe a cidade."),
  uf: z.string().length(2, "Selecione a UF."),
});

export type EnderecoFormValues = z.infer<typeof enderecoSchema>;

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

interface FormComEndereco {
  endereco: EnderecoFormValues;
}

interface CamposEnderecoProps<T extends FormComEndereco> {
  control: Control<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
}

// Reaproveitado em associados/novo e associados/[id] (edição) — mesmos campos, mesma validação.
// CEP busca a ViaCEP ao perder o foco e pré-preenche logradouro/bairro/cidade/UF; a pessoa sempre
// pode corrigir, nunca trava o formulário se a API falhar ou o CEP não existir.
export function CamposEndereco<T extends FormComEndereco>({
  control,
  errors,
  setValue,
}: CamposEnderecoProps<T>) {
  const [buscandoCep, setBuscandoCep] = useState(false);
  const erros = errors.endereco as FieldErrors<EnderecoFormValues> | undefined;

  const aoSairDoCep = async (cep: string) => {
    const digitos = cep.replace(/\D/g, "");
    if (digitos.length !== 8) return;
    setBuscandoCep(true);
    const encontrado = await buscarEnderecoPorCep(digitos);
    setBuscandoCep(false);
    if (!encontrado) return;
    setValue("endereco.logradouro" as never, encontrado.logradouro as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("endereco.bairro" as never, encontrado.bairro as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("endereco.cidade" as never, encontrado.localidade as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("endereco.uf" as never, encontrado.uf as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="endereco.cep">CEP</Label>
        <Controller
          control={control}
          name={"endereco.cep" as never}
          render={({ field }) => (
            <Input
              id="endereco.cep"
              inputMode="numeric"
              placeholder="00000-000"
              aria-invalid={!!erros?.cep}
              value={formatarCep(field.value ?? "")}
              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
              onBlur={(e) => {
                field.onBlur();
                void aoSairDoCep(e.target.value);
              }}
            />
          )}
        />
        {buscandoCep && <p className="text-xs text-muted-foreground">Buscando CEP…</p>}
        {erros?.cep && <p className="text-sm text-destructive">{erros.cep.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco.numero">Número</Label>
        <Controller
          control={control}
          name={"endereco.numero" as never}
          render={({ field }) => <Input id="endereco.numero" {...field} value={field.value ?? ""} />}
        />
        {erros?.numero && (
          <p className="text-sm text-destructive">{erros.numero.message as string}</p>
        )}
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="endereco.logradouro">Logradouro</Label>
        <Controller
          control={control}
          name={"endereco.logradouro" as never}
          render={({ field }) => (
            <Input id="endereco.logradouro" {...field} value={field.value ?? ""} />
          )}
        />
        {erros?.logradouro && (
          <p className="text-sm text-destructive">{erros.logradouro.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco.complemento">Complemento (opcional)</Label>
        <Controller
          control={control}
          name={"endereco.complemento" as never}
          render={({ field }) => (
            <Input id="endereco.complemento" {...field} value={field.value ?? ""} />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco.bairro">Bairro</Label>
        <Controller
          control={control}
          name={"endereco.bairro" as never}
          render={({ field }) => <Input id="endereco.bairro" {...field} value={field.value ?? ""} />}
        />
        {erros?.bairro && (
          <p className="text-sm text-destructive">{erros.bairro.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco.cidade">Cidade</Label>
        <Controller
          control={control}
          name={"endereco.cidade" as never}
          render={({ field }) => <Input id="endereco.cidade" {...field} value={field.value ?? ""} />}
        />
        {erros?.cidade && (
          <p className="text-sm text-destructive">{erros.cidade.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco.uf">UF</Label>
        <Controller
          control={control}
          name={"endereco.uf" as never}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="endereco.uf" className="w-full">
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {UFS.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {erros?.uf && <p className="text-sm text-destructive">{erros.uf.message as string}</p>}
      </div>
    </div>
  );
}
