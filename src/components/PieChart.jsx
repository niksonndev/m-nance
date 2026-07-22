import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = {
  'Gasto Fixo': '#e74c3c',
  'Gasto do Dia a Dia': '#f39c12',
  Investimentos: '#3498db',
  Outro: '#9b59b6',
  Salário: '#2ecc71',
  Bico: '#1abc9c',
};

const DEFAULT_COLORS = [
  '#e74c3c',
  '#f39c12',
  '#3498db',
  '#9b59b6',
  '#2ecc71',
  '#1abc9c',
  '#d4a574',
  '#f4e4c1',
];

export default function PieChart({
  data,
  labels,
  title,
  emptyMessage = 'Nenhum dado disponível',
}) {
  if (!data || data.length === 0 || data.every((d) => d === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='card flex flex-col items-center justify-center min-h-[300px]'
      >
        <div className='text-center'>
          <p className='text-monkey-muted'>{emptyMessage}</p>
        </div>
      </motion.div>
    );
  }

  const backgroundColors = labels.map(
    (label, index) =>
      CATEGORY_COLORS[label] || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  );

  const total = data.reduce((a, b) => a + b, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: window.innerWidth < 640 ? 'bottom' : 'right',
        labels: {
          color: '#e8e8e8',
          font: {
            family: 'Inter',
            size: 11,
          },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#16213e',
        titleColor: '#e8e8e8',
        bodyColor: '#e8e8e8',
        borderColor: '#6b6b8a',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className='card'
    >
      {title && (
        <h3 className='text-lg font-semibold text-monkey-text mb-4'>{title}</h3>
      )}

      {/* Container responsivo */}
      <div className='flex flex-col sm:flex-row items-center gap-4'>
        {/* Gráfico */}
        <div className='h-[200px] sm:h-[250px] w-full sm:w-1/2'>
          <Doughnut data={chartData} options={options} />
        </div>

        {/* Legenda customizada para mobile */}
        <div className='w-full sm:w-1/2 space-y-2'>
          {labels.map((label, index) => {
            const value = data[index];
            const percentage = ((value / total) * 100).toFixed(1);
            const color = backgroundColors[index];

            return (
              <div
                key={label}
                className='flex items-center justify-between text-sm'
              >
                <div className='flex items-center gap-2'>
                  <div
                    className='w-3 h-3 rounded-full flex-shrink-0'
                    style={{ backgroundColor: color }}
                  />
                  <span className='text-monkey-text truncate'>{label}</span>
                </div>
                <div className='text-right'>
                  <span className='text-monkey-text font-medium'>
                    R${' '}
                    {value.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span className='text-monkey-muted text-xs ml-2'>
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
