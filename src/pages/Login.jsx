import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Wallet } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='min-h-screen bg-monkey-bg flex items-center justify-center p-4'
    >
      <div className='w-full max-w-md'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='text-center mb-8'
        >
          <div className='w-16 h-16 bg-monkey-primary rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <Wallet className='w-8 h-8 text-monkey-bg' />
          </div>
          <h1 className='text-3xl font-bold text-monkey-text'>MonkeyNança</h1>
          <p className='text-monkey-muted mt-2'>Entre na sua conta</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='card'
        >
          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='p-3 bg-monkey-danger/10 border border-monkey-danger/20 rounded-lg text-sm text-monkey-danger'
              >
                {error}
              </motion.div>
            )}

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-monkey-text mb-2'
              >
                E-mail
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='input-field'
                placeholder='seu@email.com'
                required
                autoComplete='email'
                disabled={loading || authLoading}
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-monkey-text mb-2'
              >
                Senha
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='input-field pr-12'
                  placeholder='••••••••'
                  required
                  autoComplete='current-password'
                  disabled={loading || authLoading}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-monkey-muted hover:text-monkey-text'
                >
                  {showPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type='submit'
              disabled={loading || authLoading}
              className='w-full btn-primary py-3 flex items-center justify-center gap-2'
            >
              {loading || authLoading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='mt-6 text-center text-sm text-monkey-muted'
          >
            Não tem conta?{' '}
            <Link
              to='/register'
              className='text-monkey-primary hover:text-monkey-accent font-medium'
            >
              Cadastre-se
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
