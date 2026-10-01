import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Variáveis de ambiente ausentes. Copie .env.example para .env e preencha ' +
      'VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY antes de iniciar a aplicação.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// A anon key e a URL são públicas por natureza (vão no bundle), mas ficam aqui
// centralizadas para quem precisa falar direto com a API de auth, como a
// checagem de provedores habilitados em AuthContext.
export { supabaseUrl, supabaseKey };
