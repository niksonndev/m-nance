import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Testa a materialização das recorrências contra um cliente Supabase falso:
 * o que importa aqui é o payload lançado e, principalmente, que a mesma
 * ocorrência nunca seja lançada duas vezes (Dashboard e Transações montam o
 * mesmo hook, e o StrictMode executa os efeitos duas vezes em dev).
 */
const estado = vi.hoisted(() => ({
  tabelaDados: {},
  inserts: [],
  updates: [],
}));

vi.mock('../../lib/supabaseClient', () => {
  // Cadeia fluente mínima do supabase-js: select/eq/order devolvem a própria
  // cadeia, e ela é "thenable" para o await do final resolver os dados.
  const cadeia = (tabela) => ({
    select: () => cadeia(tabela),
    eq: () => cadeia(tabela),
    order: () => cadeia(tabela),
    insert: async (linhas) => {
      estado.inserts.push({ tabela, linhas });
      return { error: null };
    },
    update: (patch) => {
      estado.updates.push({ tabela, patch });
      return cadeia(tabela);
    },
    then: (resolve) =>
      Promise.resolve({
        data: estado.tabelaDados[tabela] ?? [],
        error: null,
      }).then(resolve),
  });

  return { supabase: { from: (tabela) => cadeia(tabela) } };
});

const { materializeRecurrences } = await import('../useRecurring');

const hoje = new Date(2026, 2, 15); // 15/03/2026

const regra = (over = {}) => ({
  id: 'regra-1',
  type: 'expense',
  amount: 89.9,
  currency: 'BRL',
  category: 'Gasto Fixo',
  description: 'Streaming',
  frequency: 'monthly',
  next_date: '2026-01-15',
  active: true,
  ...over,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(hoje);
  estado.tabelaDados = {};
  estado.inserts = [];
  estado.updates = [];
});

afterEach(() => {
  vi.useRealTimers();
});

describe('materializeRecurrences', () => {
  it('não lança nada quando não há ocorrência vencida', async () => {
    estado.tabelaDados.recurring_transactions = [
      regra({ next_date: '2026-04-15' }),
    ];

    const resultado = await materializeRecurrences('usuario-a');

    expect(resultado).toEqual({ criadas: 0, error: null });
    expect(estado.inserts).toHaveLength(0);
    expect(estado.updates).toHaveLength(0);
  });

  it('lança as ocorrências vencidas e avança o next_date', async () => {
    estado.tabelaDados.recurring_transactions = [regra()];

    const resultado = await materializeRecurrences('usuario-b');

    expect(resultado).toEqual({ criadas: 3, error: null });

    const [{ linhas }] = estado.inserts;
    expect(linhas.map((l) => l.date)).toEqual([
      '2026-01-15',
      '2026-02-15',
      '2026-03-15',
    ]);
    expect(linhas[0]).toMatchObject({
      user_id: 'usuario-b',
      type: 'expense',
      amount: 89.9,
      category: 'Gasto Fixo',
      description: 'Streaming',
      is_recurring: true,
      recurring_frequency: 'monthly',
    });

    expect(estado.updates).toEqual([
      { tabela: 'recurring_transactions', patch: { next_date: '2026-04-15' } },
    ]);
  });

  it('roda uma única vez por usuário mesmo com chamadas simultâneas', async () => {
    estado.tabelaDados.recurring_transactions = [regra()];

    const [a, b] = await Promise.all([
      materializeRecurrences('usuario-c'),
      materializeRecurrences('usuario-c'),
    ]);

    expect(a).toEqual({ criadas: 3, error: null });
    expect(b).toEqual(a);
    expect(estado.inserts).toHaveLength(1); // não lançou duas vezes
  });
});
