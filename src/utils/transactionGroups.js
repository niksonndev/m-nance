import { format, isToday, isYesterday, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseLocalDate } from './formatters';

/** Cabeçalho do dia: "Hoje"/"Ontem" quando é próximo, senão a data por extenso. */
export function rotuloDoDia(iso) {
  const data = parseLocalDate(iso);
  if (!data || !isValid(data)) return '';

  if (isToday(data)) return 'Hoje';
  if (isYesterday(data)) return 'Ontem';
  return format(data, "dd 'de' MMMM", { locale: ptBR });
}

/**
 * Agrupa os lançamentos por dia preservando a ordem recebida (a lista já chega
 * ordenada). A data sai de dentro de cada linha e vira cabeçalho de grupo: é o
 * que permite o item caber numa linha só no celular.
 */
export function agruparPorDia(transactions = []) {
  return transactions.reduce((grupos, transacao) => {
    const dia = transacao.date?.slice(0, 10) ?? '';
    const ultimo = grupos[grupos.length - 1];

    if (ultimo?.dia === dia) ultimo.itens.push(transacao);
    else grupos.push({ dia, itens: [transacao] });

    return grupos;
  }, []);
}

/** Saldo do dia: receitas menos despesas. */
export function saldoDoDia(itens = []) {
  return itens.reduce(
    (soma, t) => soma + (t.type === 'income' ? 1 : -1) * Number(t.amount),
    0,
  );
}
