import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transações', icon: CreditCard },
  { path: '/settings', label: 'Configurações', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: isOpen ? 0 : collapsed ? -80 : -280 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed top-0 left-0 z-50 h-screen bg-monkey-card border-r border-monkey-muted/30 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } lg:translate-x-0 lg:w-64`}
    >
      <div className='flex flex-col h-full'>
        <div className='flex items-center justify-between h-16 px-4 border-b border-monkey-muted/30'>
          {!collapsed && (
            <NavLink to='/dashboard' className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-monkey-primary rounded-lg flex items-center justify-center'>
                <Wallet className='w-5 h-5 text-monkey-bg' />
              </div>
              <span className='font-bold text-monkey-text text-lg'>
                Monkey Finance
              </span>
            </NavLink>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className='p-1 rounded-lg hover:bg-monkey-muted/20 text-monkey-muted lg:hidden'
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? (
              <ChevronRight className='w-5 h-5' />
            ) : (
              <ChevronLeft className='w-5 h-5' />
            )}
          </motion.button>
        </div>

        <nav className='flex-1 px-3 py-4 space-y-1 overflow-y-auto'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-monkey-primary/20 text-monkey-primary'
                    : 'text-monkey-muted hover:bg-monkey-muted/10 hover:text-monkey-text'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className='w-5 h-5 flex-shrink-0' aria-hidden='true' />
                {!collapsed && (
                  <span className='font-medium'>{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className='p-3 border-t border-monkey-muted/30'>
          {!collapsed && user && (
            <div className='mb-3 px-3 py-2 bg-monkey-muted/10 rounded-lg'>
              <p className='text-xs text-monkey-muted truncate'>{user.email}</p>
            </div>
          )}
          <NavLink
            to='/settings'
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              collapsed
                ? 'justify-center'
                : 'text-monkey-muted hover:bg-monkey-muted/10 hover:text-monkey-text'
            }`}
            title={collapsed ? 'Configurações' : undefined}
          >
            <Settings className='w-5 h-5 flex-shrink-0' aria-hidden='true' />
            {!collapsed && <span className='font-medium'>Configurações</span>}
          </NavLink>
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-monkey-danger hover:bg-monkey-danger/10 ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut className='w-5 h-5 flex-shrink-0' aria-hidden='true' />
            {!collapsed && <span className='font-medium'>Sair</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
