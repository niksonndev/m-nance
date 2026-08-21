import { describe, it, expect } from 'vitest';
import { filterAndSortTransactions } from '../transactionFilters';

const txs = [
  {
    id: 1,
    type: 'expense',
    amount: 50,
    category: 'Gasto Fixo',
    description: 'Aluguel',
    date: '2024-05-10',
  },
  {
    id: 2,
    type: 'income',
    amount: 2000,
    category: 'Salário',
    description: 'Pagamento mensal',
    date: '2024-05-05',
  },
  {
    id: 3,
    type: 'expense',
    amount: 30.5,
    category: 'Investimentos',
    description: 'Aporte, fundo',
    date: '2024-05-20',
  },
];

describe('filterAndSortTransactions', () => {
  it('filtra por tipo', () => {
    const result = filterAndSortTransactions(txs, {
      type: 'income',
      sortBy: 'date_desc',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('filtra por categoria', () => {
    const result = filterAndSortTransactions(txs, {
      category: 'Gasto Fixo',
      sortBy: 'date_desc',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('busca em descrição e categoria (case-insensitive)', () => {
    const result = filterAndSortTransactions(txs, {
      search: 'salário',
      sortBy: 'date_desc',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('filtra por faixa de valor', () => {
    const result = filterAndSortTransactions(txs, {
      minAmount: '40',
      maxAmount: '100',
      sortBy: 'date_desc',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filtra por intervalo de datas respeitando o fuso local', () => {
    const result = filterAndSortTransactions(txs, {
      dateFrom: '2024-05-05',
      dateTo: '2024-05-10',
      sortBy: 'date_desc',
    });
    // Ambas as transações das extremidades devem ser incluídas
    expect(result.map((t) => t.id)).toEqual([1, 2]);
  });

  it('ordena por valor decrescente sem mutar a lista original', () => {
    const original = [...txs];
    const result = filterAndSortTransactions(txs, { sortBy: 'amount_desc' });
    expect(result.map((t) => t.id)).toEqual([2, 1, 3]);
    expect(original.map((t) => t.id)).toEqual([1, 2, 3]); // não mutada
  });

  it('ordena por data crescente', () => {
    const result = filterAndSortTransactions(txs, { sortBy: 'date_asc' });
    expect(result.map((t) => t.id)).toEqual([2, 1, 3]);
  });

  it('usa data decrescente por padrão', () => {
    const result = filterAndSortTransactions(txs, {});
    expect(result.map((t) => t.id)).toEqual([3, 1, 2]);
  });
});
