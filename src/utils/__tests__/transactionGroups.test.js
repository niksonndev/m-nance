import { describe, it, expect, vi, afterEach } from 'vitest';
import { agruparPorDia, saldoDoDia, rotuloDoDia } from '../transactionGroups';

const t = (id, date, type, amount) => ({ id, date, type, amount });

describe('agruparPorDia', () => {
  it('junta os lançamentos do mesmo dia e preserva a ordem', () => {
    const grupos = agruparPorDia([
      t(1, '2026-10-01', 'income', 3000),
      t(2, '2026-10-01', 'expense', 30.9),
      t(3, '2026-09-30', 'expense', 64.9),
    ]);

    expect(grupos.map((g) => g.dia)).toEqual(['2026-10-01', '2026-09-30']);
    expect(grupos[0].itens.map((i) => i.id)).toEqual([1, 2]);
    expect(grupos[1].itens.map((i) => i.id)).toEqual([3]);
  });

  it('não agrupa dias não vizinhos (lista ordenada por outro critério)', () => {
    const grupos = agruparPorDia([
      t(1, '2026-10-01', 'expense', 10),
      t(2, '2026-09-30', 'expense', 10),
      t(3, '2026-10-01', 'expense', 10),
    ]);

    // três grupos: repetir o dia depois de outro dia não "volta" pro grupo
    expect(grupos).toHaveLength(3);
  });

  it('lida com lista vazia e com data ausente', () => {
    expect(agruparPorDia()).toEqual([]);
    expect(agruparPorDia([{ id: 1 }])).toEqual([
      { dia: '', itens: [{ id: 1 }] },
    ]);
  });
});

describe('saldoDoDia', () => {
  it('soma receitas e subtrai despesas', () => {
    expect(
      saldoDoDia([
        t(1, '2026-10-01', 'income', 3000),
        t(2, '2026-10-01', 'expense', 30.9),
        t(3, '2026-10-01', 'expense', '64.90'),
      ]),
    ).toBeCloseTo(2904.2);
  });

  it('é zero sem lançamentos', () => {
    expect(saldoDoDia([])).toBe(0);
  });
});

describe('rotuloDoDia', () => {
  afterEach(() => vi.useRealTimers());

  it('usa Hoje e Ontem para datas próximas', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 1, 12)); // 01/10/2026

    expect(rotuloDoDia('2026-10-01')).toBe('Hoje');
    expect(rotuloDoDia('2026-09-30')).toBe('Ontem');
  });

  it('usa a data por extenso nos dias mais antigos', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 1, 12));

    expect(rotuloDoDia('2026-09-05')).toBe('05 de setembro');
  });

  it('não quebra com data inválida', () => {
    expect(rotuloDoDia(null)).toBe('');
    expect(rotuloDoDia('qualquer coisa')).toBe('');
  });
});
