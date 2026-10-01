import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseLocalDate } from '../utils/formatters';
import { useCurrency } from '../context/CurrencyContext';
import { currencyInfo } from '../constants/currencies';

export default function Filters({
  filters,
  onFiltersChange,
  onClearFilters,
  transactions = [],
  loading = false,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { formatValue, currency } = useCurrency();

  const allCategories = [
    ...new Set(transactions.map((t) => t.category).filter(Boolean)),
  ];

  const hasActiveFilters =
    filters.type ||
    filters.category ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.search ||
    filters.minAmount ||
    filters.maxAmount;

  // A limpeza completa (incluindo ordenação e faixa de valor) vem da página;
  // sem o prop, cai num reset local que preserva a ordenação escolhida.
  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
      return;
    }
    onFiltersChange({
      ...filters,
      type: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      search: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='flex items-center gap-2 text-lg font-semibold text-monkey-text'>
          <Filter className='w-5 h-5 text-monkey-primary' />
          Filtros
        </h3>
        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearFilters}
            className='text-sm text-monkey-primary hover:text-monkey-accent flex items-center gap-1'
          >
            <X className='w-4 h-4' />
            Limpar
          </motion.button>
        )}
      </div>

      <div className='space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-monkey-text mb-1'>
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                onFiltersChange({ ...filters, type: e.target.value })
              }
              className='input-field'
              disabled={loading}
            >
              <option value=''>Todos</option>
              <option value='income'>Receitas</option>
              <option value='expense'>Despesas</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-monkey-text mb-1'>
              Categoria
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                onFiltersChange({ ...filters, category: e.target.value })
              }
              className='input-field'
              disabled={loading}
            >
              <option value=''>Todas</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-monkey-text mb-1'>
              Data inicial
            </label>
            <input
              type='date'
              value={filters.dateFrom}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateFrom: e.target.value })
              }
              className='input-field'
              max={filters.dateTo || new Date().toISOString().split('T')[0]}
              disabled={loading}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-monkey-text mb-1'>
              Data final
            </label>
            <input
              type='date'
              value={filters.dateTo}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateTo: e.target.value })
              }
              className='input-field'
              min={filters.dateFrom}
              max={new Date().toISOString().split('T')[0]}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-monkey-text mb-1'>
            Buscar
          </label>
          <div className='relative'>
            <input
              type='text'
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              placeholder='Buscar por descrição...'
              className='input-field pl-10'
              disabled={loading}
            />
            <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-monkey-muted' />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className='flex items-center gap-2 text-sm text-monkey-muted hover:text-monkey-text transition-colors'
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          />
          {showAdvanced ? 'Menos opções' : 'Mais opções'}
        </motion.button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='overflow-hidden'
            >
              <div className='pt-4 border-t border-monkey-muted/20 space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-monkey-text mb-2'>
                    Valor mínimo ({currencyInfo(currency).symbol})
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    min='0'
                    value={filters.minAmount || ''}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, minAmount: e.target.value })
                    }
                    className='input-field'
                    placeholder='0,00'
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-monkey-text mb-2'>
                    Valor máximo ({currencyInfo(currency).symbol})
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    min='0'
                    value={filters.maxAmount || ''}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, maxAmount: e.target.value })
                    }
                    className='input-field'
                    placeholder='0,00'
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-monkey-text mb-2'>
                    Ordenar por
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, sortBy: e.target.value })
                    }
                    className='input-field'
                    disabled={loading}
                  >
                    <option value='date_desc'>Data (mais recente)</option>
                    <option value='date_asc'>Data (mais antiga)</option>
                    <option value='amount_desc'>Valor (maior)</option>
                    <option value='amount_asc'>Valor (menor)</option>
                    <option value='category'>Categoria</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mt-4 p-3 bg-monkey-primary/10 border border-monkey-primary/20 rounded-lg'
        >
          <div className='flex flex-wrap gap-2 min-w-0'>
            {filters.type && (
              <span className='px-2 py-1 text-xs bg-monkey-primary/20 text-monkey-primary rounded'>
                Tipo: {filters.type === 'income' ? 'Receita' : 'Despesa'}
              </span>
            )}
            {filters.category && (
              <span className='px-2 py-1 text-xs bg-monkey-primary/20 text-monkey-primary rounded'>
                Categoria: {filters.category}
              </span>
            )}
            {filters.dateFrom && (
              <span className='px-2 py-1 text-xs bg-monkey-primary/20 text-monkey-primary rounded'>
                De:{' '}
                {format(parseLocalDate(filters.dateFrom), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
              </span>
            )}
            {filters.dateTo && (
              <span className='px-2 py-1 text-xs bg-monkey-primary/20 text-monkey-primary rounded'>
                Até:{' '}
                {format(parseLocalDate(filters.dateTo), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
              </span>
            )}
            {filters.search && (
              <span className='px-2 py-1 text-xs bg-monkey-primary/20 text-monkey-primary rounded'>
                Busca: "{filters.search}"
              </span>
            )}
            {filters.minAmount && (
              <span className='px-2 py-1 text-xs bg-monkey-primary/20 text-monkey-primary rounded'>
                Mín: {formatValue(filters.minAmount)}
              </span>
            )}
            {filters.maxAmount && (
              <span className='px-2 py-1 text-xs bg-monkey-primary/20 text-monkey-primary rounded'>
                Máx: {formatValue(filters.maxAmount)}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
