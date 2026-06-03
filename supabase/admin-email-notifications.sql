create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  order_email_enabled boolean default false not null,
  smtp_host text default 'smtp.gmail.com' not null,
  smtp_port integer default 587 not null,
  smtp_secure boolean default false not null,
  smtp_user text,
  smtp_password_encrypted text,
  mail_from text,
  admin_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_admin_all" on public.site_settings;
create policy "site_settings_admin_all" on public.site_settings
for all using (public.is_admin()) with check (public.is_admin());
