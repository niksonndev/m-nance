import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../context/AuthContext';
import TransactionList from '../components/TransactionList';
import TransactionModal from '../components/TransactionModal';
import Filters from '../components/Filters';
import { supabase } from '../lib/supabaseClient';

export default function Transactions() {
  const { user } = useAuth();
  const { transactions, loading, refetch } = useTransactions();
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    sortBy: 'date_desc',
    minAmount: '',
    maxAmount: '',
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd;
    });
  }, [transactions, monthStart, monthEnd]);

  const filteredTransactions = useMemo(() => {
    let result = [...monthlyTransactions];

    if (filters.type) {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters.category) {
      result = result.filter((t) => t.category === filters.category);
    }
    if (filters.dateFrom) {
      result = result.filter(
        (t) => new Date(t.date) >= new Date(filters.dateFrom),
      );
    }
    if (filters.dateTo) {
      result = result.filter(
        (t) => new Date(t.date) <= new Date(filters.dateTo),
      );
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description?.toLowerCase().includes(search) ||
          t.category?.toLowerCase().includes(search),
      );
    }
    if (filters.minAmount) {
      result = result.filter((t) => t.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      result = result.filter((t) => t.amount <= parseFloat(filters.maxAmount));
    }

    switch (filters.sortBy) {
      case 'date_asc':
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'amount_desc':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount_asc':
        result.sort((a, b) => a.amount - b.amount);
        break;
      case 'category':
        result.sort((a, b) =>
          (a.category || '').localeCompare(b.category || ''),
        );
        break;
      default:
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return result;
  }, [monthlyTransactions, filters]);

  const handleOpenModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    refetch();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      await supabase.from('transactions').delete().eq('id', id);
      refetch();
    }
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToCurrentMonth = () => setCurrentMonth(new Date());

  const exportToCSV = () => {
    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor'];
    const rows = filteredTransactions.map((t) => [
      format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR }),
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.category || '',
      t.description || '',
      t.amount.toString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes-${format(currentMonth, 'yyyy-MM', { locale: ptBR })}.csv`;
    link.click();
  };

  return (
    <div className='space-y-6'>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'
      >
        <div>
          <h1 className='text-2xl font-bold text-monkey-text'>Transações</h1>
          <p className='text-monkey-muted text-sm'>
            Gerencie suas transações do mês de{' '}
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </p>
        </div>
        <div className='flex items-center gap-3 flex-wrap'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevMonth}
            className='p-2 rounded-lg bg-monkey-card border border-monkey-muted/30 text-monkey-muted hover:text-monkey-text hover:border-monkey-primary/50 transition-colors'
            aria-label='Mês anterior'
          >
            <ChevronLeft className='w-5 h-5' />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToCurrentMonth}
            className='px-4 py-2 rounded-lg bg-monkey-card border border-monkey-muted/30 text-monkey-text text-sm font-medium hover:border-monkey-primary/50 transition-colors'
          >
            Mês atual
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextMonth}
            className='p-2 rounded-lg bg-monkey-card border border-monkey-muted/30 text-monkey-muted hover:text-monkey-text hover:border-monkey-primary/50 transition-colors'
            aria-label='Próximo mês'
          >
            <ChevronRight className='w-5 h-5' />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            className='btn-secondary flex items-center gap-2'
          >
            <Download className='w-4 h-4' />
            Exportar CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenModal()}
            className='btn-primary flex items-center gap-2'
          >
            <Plus className='w-4 h-4' />
            Nova transação
          </motion.button>
        </div>
      </motion.div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='lg:col-span-2 space-y-6'
        >
          <div className='card'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-monkey-text'>
                Todas as transações
              </h2>
              <span className='text-sm text-monkey-muted'>
                {filteredTransactions.length} transação
                {filteredTransactions.length !== 1 ? 'ões' : ''}
              </span>
            </div>
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='space-y-6'
        >
          <Filters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={() =>
              setFilters({
                type: '',
                category: '',
                dateFrom: '',
                dateTo: '',
                search: '',
                sortBy: 'date_desc',
                minAmount: '',
                maxAmount: '',
              })
            }
            transactions={monthlyTransactions}
            loading={loading}
          />
        </motion.div>
      </div>

      <TransactionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        transaction={editingTransaction}
      />
    </div>
  );
}
