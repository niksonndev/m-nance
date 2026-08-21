import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
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
import DashboardCards from '../components/DashboardCards';
import PieChart from '../components/PieChart';
import TransactionList from '../components/TransactionList';
import TransactionModal from '../components/TransactionModal';
import Filters from '../components/Filters';
import { formatCurrency } from '../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const { transactions, loading, getSummary, getCategorySummary, refetch,
    addTransaction, updateTransaction, deleteTransaction } = useTransactions();
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

  const stats = useMemo(() => {
    const summary = getSummary(monthlyTransactions);
    const incomeCategories = getCategorySummary('income', monthlyTransactions);
    const expenseCategories = getCategorySummary(
      'expense',
      monthlyTransactions,
    );

    return {
      ...summary,
      incomeCategories,
      expenseCategories,
    };
  }, [monthlyTransactions, getSummary, getCategorySummary]);

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

  const handleSave = async (transactionData) => {
    if (editingTransaction) {
      return updateTransaction(editingTransaction.id, transactionData);
    }
    return addTransaction(transactionData);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      const { error } = await deleteTransaction(id);
      if (error) console.error('Erro ao excluir transação:', error);
      refetch();
    }
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToCurrentMonth = () => setCurrentMonth(new Date());

  return (
    <div className='space-y-6'>
      {/* Header com navegação de mês */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col gap-4'
      >
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-bold text-monkey-text'>Dashboard</h1>
            <p className='text-monkey-muted text-sm'>
              Visão geral do mês de{' '}
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
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
            className='px-3 sm:px-4 py-2 rounded-lg bg-monkey-card border border-monkey-muted/30 text-monkey-text text-sm font-medium hover:border-monkey-primary/50 transition-colors'
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
            onClick={() => handleOpenModal()}
            className='btn-primary flex items-center gap-2 ml-auto'
          >
            <Plus className='w-4 h-4' />
            <span className='hidden sm:inline'>Nova transação</span>
            <span className='sm:hidden'>Nova</span>
          </motion.button>
        </div>
      </motion.div>

      {/* DashboardCards - horizontal no desktop, vertical no mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DashboardCards stats={stats} />
      </motion.div>

      {/* Layout principal: flexbox responsivo */}
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Coluna esquerda: Lista de transações (ocupa espaço restante) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='flex-1 min-w-0 lg:pr-0'
        >
          <div className='card'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-monkey-text'>
                Transações do mês
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

        {/* Coluna direita: Sidebar fixa 320px (w-80) com filtros e gráficos */}
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='w-full lg:w-80 flex-shrink-0 flex flex-col gap-6'
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
              })
            }
            transactions={monthlyTransactions}
            loading={loading}
          />

          <PieChart
            data={Object.values(stats.expenseCategories)}
            labels={Object.keys(stats.expenseCategories)}
            title='Despesas por categoria'
            emptyMessage='Nenhuma despesa neste mês'
          />

          <PieChart
            data={Object.values(stats.incomeCategories)}
            labels={Object.keys(stats.incomeCategories)}
            title='Receitas por categoria'
            emptyMessage='Nenhuma receita neste mês'
          />
        </motion.aside>
      </div>

      <TransactionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        onSave={handleSave}
        transaction={editingTransaction}
      />
    </div>
  );
}
