/**
 * Fonte única de verdade para categorias de transações e cores dos gráficos.
 * Importe daqui em vez de duplicar listas nos componentes.
 */

export const CATEGORIES = {
  income: ['Salário', 'Bico', 'Outro'],
  expense: ['Gasto Fixo', 'Gasto do Dia a Dia', 'Investimentos', 'Outro'],
};

export const CATEGORY_COLORS = {
  'Gasto Fixo': '#e74c3c',
  'Gasto do Dia a Dia': '#f39c12',
  Investimentos: '#3498db',
  Outro: '#9b59b6',
  Salário: '#2ecc71',
  Bico: '#1abc9c',
};

export const DEFAULT_CHART_COLORS = [
  '#e74c3c',
  '#f39c12',
  '#3498db',
  '#9b59b6',
  '#2ecc71',
  '#1abc9c',
  '#d4a574',
  '#f4e4c1',
];
