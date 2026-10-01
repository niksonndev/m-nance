import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '../lib/supabaseClient';
import { limparCacheRecorrencias } from '../hooks/useRecurring';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUser]);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    // Limpa a trava de geração por sessão: quem entrar em seguida (ou o mesmo
    // usuário mais tarde) precisa materializar as recorrências de novo.
    limparCacheRecorrencias();
    return { error };
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
