-- ============================================================================
-- Migration: função RPC para o usuário excluir a própria conta
--
-- Contexto: a API supabase.auth.admin.deleteUser() exige a service_role key
-- e NÃO pode ser executada no browser. A exclusão da conta é feita via RPC
-- (supabase.rpc('delete_account')), executada como security definer.
--
-- Como aplicar: rode este script no SQL Editor do Supabase (ou via
-- `supabase db push` se estiver usando o CLI).
-- ============================================================================

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado';
  end if;

  -- Remove os dados de negócio do usuário
  delete from public.transactions where user_id = auth.uid();

  -- Remove o usuário do auth (ON DELETE CASCADE limpa identities,
  -- refresh tokens, sessions e outros registros relacionados)
  delete from auth.users where id = auth.uid();
end;
$$;

-- Apenas usuários autenticados podem executar
revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
