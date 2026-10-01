/**
 * Moedas suportadas pelo app.
 *
 * A moeda é uma configuração global (uma por usuário, ver CurrencyContext): o
 * app inteiro exibe a mesma unidade. Trocar aqui NÃO converte valores já
 * lançados — não há cotação — apenas muda a unidade exibida.
 */
export const CURRENCIES = [
  { code: 'BRL', symbol: 'R$', label: 'Real brasileiro' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'Dólar americano' },
];

export const DEFAULT_CURRENCY = 'BRL';

export const isCurrency = (code) =>
  CURRENCIES.some((moeda) => moeda.code === code);

export const currencyInfo = (code) =>
  CURRENCIES.find((moeda) => moeda.code === code) ?? CURRENCIES[0];

/**
 * Persistência da moeda escolhida. Fica aqui (módulo puro, sem React) para
 * poder ser usada fora de componente — ex.: os lançamentos gerados pelas
 * recorrências — sem criar dependência circular entre contextos.
 *
 * A chave mantém o prefixo antigo (monkeynanca:) de propósito: renomear
 * apagaria as preferências já salvas de quem usa o app.
 */
export const currencyStorageKey = (userId) => `monkeynanca:currency:${userId}`;

export function getSavedCurrency(userId) {
  if (!userId) return DEFAULT_CURRENCY;

  try {
    const salva = localStorage.getItem(currencyStorageKey(userId));
    return isCurrency(salva) ? salva : DEFAULT_CURRENCY;
  } catch (error) {
    console.error('Erro ao ler a moeda salva:', error);
    return DEFAULT_CURRENCY;
  }
}

export function saveCurrency(userId, code) {
  if (!userId || !isCurrency(code)) return;

  try {
    localStorage.setItem(currencyStorageKey(userId), code);
  } catch (error) {
    console.error('Erro ao salvar a moeda:', error);
  }
}
