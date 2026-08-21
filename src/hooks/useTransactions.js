import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transaction) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select();

      if (error) throw error;
      setTransactions((prev) => [data[0], ...prev]);
      return { data: data[0], error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  const updateTransaction = async (id, updates) => {
    if (!user) return { data: null, error: 'Usuário não autenticado' };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) throw error;
      if (!data?.length) {
        return {
          data: null,
          error: 'Transação não encontrada ou sem permissão',
        };
      }
      setTransactions((prev) => prev.map((t) => (t.id === id ? data[0] : t)));
      return { data: data[0], error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  };

  const getSummary = (txs = transactions) => {
    const income = txs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = txs // ← mudei o nome da variável
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  };

  const getCategorySummary = (type, txs = transactions) => {
    return txs
      .filter((t) => t.type === type)
      .reduce((acc, t) => {
        const category = t.category || 'Outros';
        acc[category] = (acc[category] || 0) + Number(t.amount);
        return acc;
      }, {});
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getSummary,
    getCategorySummary,
    refetch: fetchTransactions,
  };
}
