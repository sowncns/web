create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  balance numeric default 0 not null,
  role text default 'USER' check (role in ('USER', 'ADMIN')),
  status text default 'ACTIVE' check (status in ('ACTIVE', 'BANNED')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles add column if not exists balance numeric default 0 not null;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  price numeric not null,
  duration text,
  warranty_policy text,
  delivery_guide text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.stock_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  username_encrypted text not null,
  password_encrypted text not null,
  note_encrypted text,
  duration text,
  status text default 'AVAILABLE' check (status in ('AVAILABLE', 'USED', 'DISABLED')),
  used_by_order_id uuid,
  created_at timestamptz default now(),
  used_at timestamptz
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text,
  customer_email text,
  customer_phone text,
  product_id uuid references public.products(id) on delete set null,
  quantity integer default 1,
  total_amount numeric not null,
  order_code bigint unique not null,
  payment_provider text default 'PAYOS',
  payment_status text default 'PENDING' check (payment_status in ('PENDING', 'PAID', 'CANCELLED', 'EXPIRED', 'REFUNDED')),
  order_status text default 'PENDING' check (order_status in ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED')),
  delivery_username_encrypted text,
  delivery_password_encrypted text,
  delivery_note_encrypted text,
  note text,
  created_at timestamptz default now(),
  paid_at timestamptz,
  updated_at timestamptz default now()
);

create table if not exists public.order_deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  username_encrypted text not null,
  password_encrypted text not null,
  note_encrypted text,
  created_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'stock_items_used_order_fk'
  ) then
    alter table public.stock_items add constraint stock_items_used_order_fk foreign key (used_by_order_id) references public.orders(id) on delete set null;
  end if;
end $$;

create table if not exists public.payment_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  topup_id uuid,
  provider text,
  raw_data jsonb,
  created_at timestamptz default now()
);

create table if not exists public.wallet_topups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  amount numeric not null,
  order_code bigint unique not null,
  payment_provider text default 'PAYOS',
  payment_status text default 'PENDING' check (payment_status in ('PENDING', 'PAID', 'CANCELLED', 'EXPIRED', 'REFUNDED')),
  checkout_url text,
  qr_code text,
  account_number text,
  account_name text,
  description text,
  created_at timestamptz default now(),
  paid_at timestamptz,
  updated_at timestamptz default now()
);

alter table public.payment_logs add column if not exists topup_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payment_logs_topup_fk'
  ) then
    alter table public.payment_logs add constraint payment_logs_topup_fk foreign key (topup_id) references public.wallet_topups(id) on delete cascade;
  end if;
end $$;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  title text not null,
  message text not null,
  status text default 'OPEN' check (status in ('OPEN', 'REPLIED', 'CLOSED')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ticket_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.support_tickets(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN' and status = 'ACTIVE'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_profile_privilege_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') then
    return new;
  end if;

  if not public.is_admin() and (new.role is distinct from old.role or new.status is distinct from old.status) then
    raise exception 'Không được tự cập nhật role/status';
  end if;
  return new;
end;
$$;

create or replace function public.mark_wallet_topup_paid(p_order_code bigint)
returns public.wallet_topups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_topup public.wallet_topups;
begin
  select * into v_topup
  from public.wallet_topups
  where order_code = p_order_code
  for update;

  if not found then
    return null;
  end if;

  if v_topup.payment_status = 'PAID' then
    return v_topup;
  end if;

  update public.wallet_topups
  set payment_status = 'PAID',
      paid_at = now(),
      updated_at = now()
  where id = v_topup.id
  returning * into v_topup;

  update public.profiles
  set balance = coalesce(balance, 0) + v_topup.amount,
      updated_at = now()
  where id = v_topup.user_id;

  return v_topup;
end;
$$;

create or replace function public.purchase_product_with_balance(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity integer,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products;
  v_profile public.profiles;
  v_total numeric;
  v_order public.orders;
  v_order_code bigint;
begin
  if p_quantity < 1 or p_quantity > 20 then
    raise exception 'Số lượng không hợp lệ';
  end if;

  select * into v_profile
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'Không tìm thấy tài khoản';
  end if;

  if v_profile.status <> 'ACTIVE' then
    raise exception 'Tài khoản đã bị khóa';
  end if;

  select * into v_product
  from public.products
  where id = p_product_id and is_active = true;

  if not found then
    raise exception 'Sản phẩm không khả dụng';
  end if;

  v_total := v_product.price * p_quantity;

  if coalesce(v_profile.balance, 0) < v_total then
    raise exception 'Số dư không đủ';
  end if;

  update public.profiles
  set balance = balance - v_total,
      updated_at = now()
  where id = p_user_id;

  v_order_code := floor(extract(epoch from clock_timestamp()) * 1000)::bigint + floor(random() * 900 + 100)::bigint;

  insert into public.orders (
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    product_id,
    quantity,
    total_amount,
    order_code,
    payment_provider,
    payment_status,
    order_status,
    note,
    paid_at
  )
  values (
    p_user_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_product_id,
    p_quantity,
    v_total,
    v_order_code,
    'BALANCE',
    'PAID',
    'PROCESSING',
    p_note,
    now()
  )
  returning * into v_order;

  return jsonb_build_object(
    'orderId', v_order.id,
    'orderCode', v_order.order_code,
    'totalAmount', v_order.total_amount,
    'balance', coalesce(v_profile.balance, 0) - v_total
  );
end;
$$;

drop trigger if exists prevent_profile_privilege_update_trigger on public.profiles;
create trigger prevent_profile_privilege_update_trigger
before update on public.profiles
for each row execute function public.prevent_profile_privilege_update();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.stock_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_deliveries enable row level security;
alter table public.wallet_topups enable row level security;
alter table public.payment_logs enable row level security;
alter table public.support_tickets enable row level security;
alter table public.ticket_replies enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert" on public.profiles for insert with check (auth.uid() = id and coalesce(role, 'USER') = 'USER' and coalesce(status, 'ACTIVE') = 'ACTIVE');
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories_public_select" on public.categories;
create policy "categories_public_select" on public.categories for select using (true);
drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_public_select_active" on public.products;
create policy "products_public_select_active" on public.products for select using (is_active = true);
drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "stock_admin_all" on public.stock_items;
create policy "stock_admin_all" on public.stock_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_user_select" on public.orders;
create policy "orders_user_select" on public.orders for select using (auth.uid() = user_id);
drop policy if exists "orders_user_insert" on public.orders;
create policy "orders_user_insert" on public.orders for insert with check (auth.uid() = user_id or user_id is null);
drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_deliveries_user_select" on public.order_deliveries;
create policy "order_deliveries_user_select" on public.order_deliveries for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id
      and o.user_id = auth.uid()
      and o.payment_status = 'PAID'
      and o.order_status = 'COMPLETED'
  )
);
drop policy if exists "order_deliveries_admin_all" on public.order_deliveries;
create policy "order_deliveries_admin_all" on public.order_deliveries for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "wallet_topups_user_select" on public.wallet_topups;
create policy "wallet_topups_user_select" on public.wallet_topups for select using (auth.uid() = user_id);
drop policy if exists "wallet_topups_user_insert" on public.wallet_topups;
create policy "wallet_topups_user_insert" on public.wallet_topups for insert with check (auth.uid() = user_id);
drop policy if exists "wallet_topups_admin_all" on public.wallet_topups;
create policy "wallet_topups_admin_all" on public.wallet_topups for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "payment_logs_admin_all" on public.payment_logs;
create policy "payment_logs_admin_all" on public.payment_logs for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "tickets_user_select" on public.support_tickets;
create policy "tickets_user_select" on public.support_tickets for select using (auth.uid() = user_id);
drop policy if exists "tickets_user_insert" on public.support_tickets;
create policy "tickets_user_insert" on public.support_tickets for insert with check (auth.uid() = user_id);
drop policy if exists "tickets_user_update" on public.support_tickets;
create policy "tickets_user_update" on public.support_tickets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "tickets_admin_all" on public.support_tickets;
create policy "tickets_admin_all" on public.support_tickets for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "ticket_replies_user_select" on public.ticket_replies;
create policy "ticket_replies_user_select" on public.ticket_replies for select using (exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()));
drop policy if exists "ticket_replies_user_insert" on public.ticket_replies;
create policy "ticket_replies_user_insert" on public.ticket_replies for insert with check (exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()));
drop policy if exists "ticket_replies_admin_all" on public.ticket_replies;
create policy "ticket_replies_admin_all" on public.ticket_replies for all using (public.is_admin()) with check (public.is_admin());

create index if not exists products_slug_idx on public.products(slug);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_order_code_idx on public.orders(order_code);
create index if not exists order_deliveries_order_id_idx on public.order_deliveries(order_id);
create index if not exists wallet_topups_user_id_idx on public.wallet_topups(user_id);
create index if not exists wallet_topups_order_code_idx on public.wallet_topups(order_code);
create index if not exists stock_items_product_status_idx on public.stock_items(product_id, status);
