-- 1. Запустите этот файл в Supabase SQL Editor один раз.
-- 2. Затем запросите magic link на странице /#/admin или ?admin=1.
-- 3. После появления пользователя в Authentication > Users выполните команду в конце файла.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can read RSVPs" on public.rsvps;
create policy "Admins can read RSVPs"
on public.rsvps
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can delete RSVPs" on public.rsvps;
create policy "Admins can delete RSVPs"
on public.rsvps
for delete
to authenticated
using (public.is_admin());

grant select, delete on public.rsvps to authenticated;

-- ПОСЛЕ ПЕРВОГО ЗАПРОСА MAGIC LINK:
-- выполните эту команду для выдачи доступа двум админам:
-- insert into public.admin_users (user_id)
-- select id
-- from auth.users
-- where lower(email) in (
--   lower('ovsepyanannette@gmail.com'),
--   lower('mirzoevhan77@mail.ru')
-- )
-- on conflict (user_id) do nothing;
