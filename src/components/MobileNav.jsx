import { Menu, X, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function MobileNav({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className='fixed top-0 left-0 right-0 z-30 bg-monkey-card/95 backdrop-blur-sm border-b border-monkey-muted/30 lg:hidden'>
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-monkey-primary rounded-lg flex items-center justify-center'>
            <Wallet className='w-5 h-5 text-monkey-bg' />
          </div>
          <span className='font-bold text-monkey-text text-lg'>
            MonkeyNança
          </span>
        </div>

        <div className='flex items-center gap-2'>
          {user && (
            <span className='text-xs text-monkey-muted hidden sm:block max-w-[120px] truncate'>
              {user.email}
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMenuClick}
            className='p-2 rounded-lg text-monkey-text hover:bg-monkey-muted/10'
            aria-label='Abrir menu'
          >
            <Menu className='w-6 h-6' />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
