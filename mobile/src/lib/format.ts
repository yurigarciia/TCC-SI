const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarMoeda(valor: number): string {
  return formatadorMoeda.format(valor);
}

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// "2026-08" -> "Agosto/2026"
export function formatarCompetencia(competencia: string): string {
  const [ano, mes] = competencia.split("-");
  const indice = Number(mes) - 1;
  return `${MESES[indice] ?? mes}/${ano}`;
}

export function formatarData(iso: string): string {
  const data = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return data.toLocaleDateString("pt-BR");
}

export function formatarDataHora(iso: string): string {
  const data = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  const dataFormatada = data.toLocaleDateString("pt-BR");
  const horaFormatada = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return horaFormatada === "00:00" ? dataFormatada : `${dataFormatada} às ${horaFormatada}`;
}
