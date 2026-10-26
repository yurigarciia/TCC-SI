const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarMoeda(valor: number): string {
  return formatadorMoeda.format(valor);
}

export function formatarData(iso: string): string {
  const data = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return data.toLocaleDateString("pt-BR");
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Converte um ISO vindo da API pro formato que <input type="datetime-local"> espera
// (AAAA-MM-DDTHH:mm, em horário local — usa os getters locais do Date de propósito, não os UTC).
// A volta é direta: new Date(valorDoInput).toISOString() já reconstrói o ISO em UTC.
export function paraInputDatetimeLocal(iso: string): string {
  const data = new Date(iso);
  const preencher = (n: number) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${preencher(data.getMonth() + 1)}-${preencher(data.getDate())}T${preencher(data.getHours())}:${preencher(data.getMinutes())}`;
}

// Guards de "data absurda" — espelham IsNotPastDate/IsPlausibleBirthDate do backend
// (shared/validators/date-validators.ts), reaproveitados pelos schemas zod dos formulários pra
// dar o erro já na tela, sem precisar de round-trip até a API.
const TOLERANCIA_EVENTO_PASSADO_MS = 60 * 60 * 1000;

export function ehDataPassada(iso: string): boolean {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return true;
  return data.getTime() < Date.now() - TOLERANCIA_EVENTO_PASSADO_MS;
}

export function ehDataNascimentoPlausivel(iso: string, idadeMaximaAnos = 120): boolean {
  const data = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(data.getTime())) return false;
  const agora = new Date();
  if (data.getTime() > agora.getTime()) return false;
  const dataMinima = new Date(agora);
  dataMinima.setFullYear(dataMinima.getFullYear() - idadeMaximaAnos);
  return data.getTime() >= dataMinima.getTime();
}

// Máscara visual de CPF (000.000.000-00) — puramente de exibição, formata progressivamente
// enquanto a pessoa digita. Quem chama guarda/envia só os dígitos (ver uso em associados/novo).
export function formatarCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// Máscara visual de CEP (00000-000) — mesmo raciocínio de formatarCpf.
export function formatarCep(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  return digitos.replace(/(\d{5})(\d)/, "$1-$2");
}

// Código curto e legível do ingresso (ex.: "#003") — contador sequencial por evento, não o UUID.
export function formatarCodigoIngresso(codigo: number): string {
  return `#${String(codigo).padStart(3, "0")}`;
}

export function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length === 0) return "";
  const ddd = digitos.slice(0, 2);
  if (digitos.length <= 2) return `(${ddd}`;

  // 11 dígitos = celular (9 no número local, ex.: 99999-0000); 10 = fixo (8, ex.: 9999-0000).
  const restante = digitos.slice(2);
  const tamanhoPrefixo = digitos.length > 10 ? 5 : 4;
  const prefixo = restante.slice(0, tamanhoPrefixo);
  const sufixo = restante.slice(tamanhoPrefixo);
  return sufixo ? `(${ddd}) ${prefixo}-${sufixo}` : `(${ddd}) ${prefixo}`;
}
