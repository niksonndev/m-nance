import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  getSavedCurrency,
  isCurrency,
  saveCurrency,
} from '../constants/currencies';
import { formatCurrency } from '../utils/formatters';

/**
 * Moeda do app: uma configuração global por usuário, guardada no localStorage
 * (mesmo padrão das preferências de notificação). Tudo que exibe valor usa
 * `formatValue` daqui, então trocar a moeda muda a unidade no app inteiro.
 */
const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);

  // Carrega a moeda do usuário (trocar de conta troca a moeda exibida)
  useEffect(() => {
    setCurrencyState(getSavedCurrency(user?.id));
  }, [user?.id]);

  const setCurrency = useCallback(
    (code) => {
      if (!isCurrency(code)) return;

      setCurrencyState(code);
      saveCurrency(user?.id, code);
    },
    [user?.id],
  );

  const value = useMemo(
    () => ({
      currency,
      currencies: CURRENCIES,
      setCurrency,
      /** Formata um valor na moeda ativa do app. */
      formatValue: (valor) => formatCurrency(valor, currency),
    }),
    [currency, setCurrency],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency deve ser usado dentro de um CurrencyProvider');
  }
  return context;
}
