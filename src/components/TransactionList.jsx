import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Calendar,
  Clock,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { parseLocalDate } from '../utils/formatters';

const TYPE_LABELS = {
  income: 'Receita',
  expense: 'Despesa',
};

const TYPE_COLORS = {
  income: 'text-monkey-success bg-monkey-success/10',
  expense: 'text-monkey-danger bg-monkey-danger/10',
};

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  loading,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  if (loading) {
    return (
      <div className='space-y-3'>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className='card animate-pulse flex items-center gap-4'
          >
            <div className='w-12 h-12 bg-monkey-muted/20 rounded-lg' />
            <div className='flex-1 space-y-2'>
              <div className='h-4 bg-monkey-muted/20 rounded w-3/4' />
              <div className='h-3 bg-monkey-muted/20 rounded w-1/2' />
            </div>
            <div className='w-24 h-6 bg-monkey-muted/20 rounded text-right' />
          </motion.div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='card flex flex-col items-center justify-center py-12 text-center'
      >
        <div className='w-16 h-16 bg-monkey-muted/10 rounded-full flex items-center justify-center mb-4'>
          <CreditCard className='w-8 h-8 text-monkey-muted' />
        </div>
        <h3 className='text-lg font-medium text-monkey-text mb-1'>
          Nenhuma transação
        </h3>
        <p className='text-monkey-muted text-sm'>
          Comece adicionando sua primeira transação
        </p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <div className='space-y-2'>
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.05 }}
            className='card flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 hover:border-monkey-primary/30 transition-colors relative overflow-hidden'
          >
            <div
              className={`w-2 h-full rounded-full ${transaction.type === 'income' ? 'bg-monkey-success' : 'bg-monkey-danger'}`}
            />

            <div className='flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <span className='font-medium text-monkey-text truncate'>
                  {transaction.category || 'Sem categoria'}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${TYPE_COLORS[transaction.type]}`}
                >
                  {TYPE_LABELS[transaction.type]}
                </span>
              </div>

              <div className='flex items-center gap-2 w-full sm:w-auto sm:justify-end'>
                {transaction.description && (
                  <p className='text-sm text-monkey-muted truncate hidden sm:block'>
                    {transaction.description}
                  </p>
                )}
                <span
                  className={`font-bold ${transaction.type === 'income' ? 'text-monkey-success' : 'text-monkey-danger'} text-sm sm:text-base whitespace-nowrap'`}
                >
                  {transaction.type === 'income' ? '+' : '-'}R${' '}
                  {Number(transaction.amount).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className='flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0 text-xs text-monkey-muted w-full sm:w-auto'>
                <span className='flex items-center gap-1'>
                  <Calendar className='w-3 h-3' />
                  {format(parseLocalDate(transaction.date), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                </span>
                {transaction.created_at && (
                  <span className='flex items-center gap-1 hidden sm:inline-flex'>
                    <Clock className='w-3 h-3' />
                    Criado em{' '}
                    {format(
                      new Date(transaction.created_at),
                      'dd/MM/yyyy HH:mm',
                      { locale: ptBR },
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className='flex items-center gap-1 w-full sm:w-auto sm:justify-end'>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(transaction)}
                className='p-2 rounded-lg text-monkey-muted hover:bg-monkey-muted/10 hover:text-monkey-text transition-colors'
                aria-label='Editar transação'
              >
                <Edit className='w-4 h-4' />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDeletingId(transaction.id)}
                disabled={deletingId === transaction.id}
                className='p-2 rounded-lg text-monkey-muted hover:bg-monkey-danger/10 hover:text-monkey-danger transition-colors'
                aria-label='Excluir transação'
              >
                {deletingId === transaction.id ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Trash2 className='w-4 h-4' />
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
