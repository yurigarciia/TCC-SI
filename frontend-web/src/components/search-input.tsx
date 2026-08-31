"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}

// Campo de busca textual compartilhado por toda listagem paginada do painel — muda o termo e
// volta pra página 1 é responsabilidade de quem chama (ver uso em cada page.tsx).
export function SearchInput({ value, onChange, placeholder = "Buscar" }: SearchInputProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8"
      />
    </div>
  );
}
