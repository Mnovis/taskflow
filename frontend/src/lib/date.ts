import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Datas de entrega são armazenadas como "dia de calendário puro" (meia-noite
// UTC), sem hora relevante. Se a gente simplesmente fizesse
// `format(new Date(isoString), ...)`, o date-fns formataria usando o fuso
// horário LOCAL do navegador — e meia-noite UTC vira "23h do dia anterior"
// em fusos negativos (como o do Brasil), fazendo a data parecer errada.
//
// Aqui, extraímos os componentes de data em UTC (o "dia real" que foi
// salvo) e construímos um Date local equivalente só pra formatação,
// sem nunca deixar o fuso horário do navegador deslocar o dia exibido.
export function formatDueDate(isoString: string, pattern = "d MMM"): string {
  const utcDate = new Date(isoString);
  const localEquivalent = new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate()
  );
  return format(localEquivalent, pattern, { locale: ptBR });
}