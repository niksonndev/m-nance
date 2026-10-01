import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '../context/CurrencyContext';

const cards = [
  {
    title: 'Saldo Total',
    value: 'balance',
    icon: Wallet,
    color: 'text-monkey-primary',
    bg: 'bg-monkey-primary/10',
    prefix: '',
  },
  {
    title: 'Receitas',
    value: 'income',
    icon: TrendingUp,
    color: 'text-monkey-success',
    bg: 'bg-monkey-success/10',
    prefix: '+',
  },
  {
    title: 'Despesas',
    value: 'expenses',
    icon: TrendingDown,
    color: 'text-monkey-danger',
    bg: 'bg-monkey-danger/10',
    prefix: '-',
  },
];

export default function DashboardCards({ stats }) {
  const { formatValue } = useCurrency();

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
      {cards.map((card, index) => (
        <motion.div
          key={card.value}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className='card group p-3 sm:p-4'
        >
          <div className='flex items-center justify-between'>
            <div className={`p-2 sm:p-3 rounded-xl ${card.bg}`}>
              <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.color}`} />
            </div>
          </div>
          <div className='mt-3 sm:mt-4'>
            <p className='text-xs sm:text-sm text-monkey-muted'>{card.title}</p>
            <p
              className={`text-lg sm:text-xl sm:text-2xl font-bold mt-1 truncate ${
                card.value === 'balance' && stats.balance < 0
                  ? 'text-monkey-danger'
                  : 'text-monkey-text'
              }`}
            >
              {card.value === 'balance' && formatValue(stats.balance)}
              {card.value === 'income' &&
                `${card.prefix}${formatValue(stats.income)}`}
              {card.value === 'expenses' &&
                `${card.prefix}${formatValue(stats.expenses)}`}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
