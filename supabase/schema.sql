create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text,
  full_name text,
  balance numeric default 0 not null,
  role text default 'USER' check (role in ('USER', 'ADMIN')),
  status text default 'ACTIVE' check (status in ('ACTIVE', 'BANNED')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles add column if not exists balance numeric default 0 not null;
alter table public.profiles add column if not exists username text;
alter table public.profiles drop column if exists phone;
create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username)) where username is not null;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category_type text default 'ACCOUNT' check (category_type in ('ACCOUNT', 'TEMPLATE')),
  created_at timestamptz default now()
);

alter table public.categories add column if not exists category_type text default 'ACCOUNT';
update public.categories set category_type = 'ACCOUNT' where category_type is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'categories_category_type_check'
  ) then
    alter table public.categories add constraint categories_category_type_check check (category_type in ('ACCOUNT', 'TEMPLATE'));
  end if;
end $$;

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

create sequence if not exists public.order_code_seq
  as bigint
  start with 900000000000000
  increment by 1
  minvalue 900000000000000
  maxvalue 999999999999999
  cache 1;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text,
  customer_email text,
  product_id uuid references public.products(id) on delete set null,
  quantity integer default 1,
  subtotal_amount numeric not null default 0,
  discount_amount numeric not null default 0,
  voucher_code text,
  total_amount numeric not null,
  order_code bigint unique not null default nextval('public.order_code_seq'),
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

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('PERCENT', 'FIXED')),
  discount_value numeric not null check (discount_value > 0),
  min_order_amount numeric default 0 not null check (min_order_amount >= 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer default 0 not null check (used_count >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean default true not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders add column if not exists subtotal_amount numeric not null default 0;
alter table public.orders add column if not exists discount_amount numeric not null default 0;
alter table public.orders add column if not exists voucher_code text;
update public.orders set subtotal_amount = total_amount where subtotal_amount = 0;

alter table public.orders drop column if exists customer_phone;

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
  order_code bigint unique not null default nextval('public.order_code_seq'),
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

alter table public.orders alter column order_code set default nextval('public.order_code_seq');
alter table public.wallet_topups alter column order_code set default nextval('public.order_code_seq');

select setval(
  'public.order_code_seq',
  greatest(
    900000000000000,
    coalesce((select max(order_code) + 1 from (
      select order_code from public.orders
      union all
      select order_code from public.wallet_topups
    ) existing_order_codes), 900000000000000)
  ),
  false
);

create or replace function public.next_order_code()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
begin
  return nextval('public.order_code_seq');
end;
$$;

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
  insert into public.profiles (id, email, username, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'username',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
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

drop function if exists public.purchase_product_with_balance(uuid, uuid, integer, text, text, text, text);
drop function if exists public.purchase_product_with_balance(uuid, uuid, integer, text, text, text);

create or replace function public.purchase_product_with_balance(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity integer,
  p_customer_name text,
  p_customer_email text,
  p_note text default '',
  p_voucher_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products;
  v_profile public.profiles;
  v_voucher public.vouchers;
  v_subtotal numeric;
  v_discount numeric := 0;
  v_total numeric;
  v_voucher_code text;
  v_order public.orders;
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

  v_subtotal := v_product.price * p_quantity;
  v_total := v_subtotal;
  v_voucher_code := nullif(upper(trim(coalesce(p_voucher_code, ''))), '');

  if v_voucher_code is not null then
    select * into v_voucher
    from public.vouchers
    where code = v_voucher_code
    for update;

    if not found or not v_voucher.is_active then
      raise exception 'Voucher không tồn tại hoặc đã tắt';
    end if;

    if v_voucher.starts_at is not null and v_voucher.starts_at > now() then
      raise exception 'Voucher chưa đến thời gian sử dụng';
    end if;

    if v_voucher.expires_at is not null and v_voucher.expires_at < now() then
      raise exception 'Voucher đã hết hạn';
    end if;

    if v_voucher.max_uses is not null and v_voucher.used_count >= v_voucher.max_uses then
      raise exception 'Voucher đã hết lượt sử dụng';
    end if;

    if v_subtotal < v_voucher.min_order_amount then
      raise exception 'Đơn hàng chưa đạt giá trị tối thiểu để dùng voucher';
    end if;

    if v_voucher.discount_type = 'PERCENT' then
      v_discount := floor(v_subtotal * v_voucher.discount_value / 100);
    else
      v_discount := v_voucher.discount_value;
    end if;

    v_discount := greatest(0, least(v_subtotal, v_discount));
    v_total := greatest(0, v_subtotal - v_discount);
  end if;

  if coalesce(v_profile.balance, 0) < v_total then
    raise exception 'Số dư không đủ';
  end if;

  update public.profiles
  set balance = balance - v_total,
      updated_at = now()
  where id = p_user_id;

  insert into public.orders (
    user_id,
    customer_name,
    customer_email,
    product_id,
    quantity,
    subtotal_amount,
    discount_amount,
    voucher_code,
    total_amount,
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
    p_product_id,
    p_quantity,
    v_subtotal,
    v_discount,
    v_voucher_code,
    v_total,
    'BALANCE',
    'PAID',
    'PROCESSING',
    p_note,
    now()
  )
  returning * into v_order;

  if v_voucher_code is not null then
    update public.vouchers
    set used_count = used_count + 1,
        updated_at = now()
    where id = v_voucher.id;
  end if;

  return jsonb_build_object(
    'orderId', v_order.id,
    'orderCode', v_order.order_code,
    'subtotalAmount', v_order.subtotal_amount,
    'discountAmount', v_order.discount_amount,
    'voucherCode', v_order.voucher_code,
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
alter table public.vouchers enable row level security;
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

drop policy if exists "vouchers_admin_all" on public.vouchers;
create policy "vouchers_admin_all" on public.vouchers for all using (public.is_admin()) with check (public.is_admin());

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
create index if not exists vouchers_code_idx on public.vouchers(code);
create index if not exists vouchers_active_expires_idx on public.vouchers(is_active, expires_at);
create index if not exists order_deliveries_order_id_idx on public.order_deliveries(order_id);
create index if not exists wallet_topups_user_id_idx on public.wallet_topups(user_id);
create index if not exists wallet_topups_order_code_idx on public.wallet_topups(order_code);
create index if not exists stock_items_product_status_idx on public.stock_items(product_id, status);
create index if not exists categories_type_name_idx on public.categories(category_type, name);
create index if not exists products_active_created_idx on public.products(is_active, created_at desc);
create index if not exists products_category_active_created_idx on public.products(category_id, is_active, created_at desc);
create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_created_idx on public.orders(payment_status, order_status, created_at desc);
create index if not exists stock_items_status_created_idx on public.stock_items(status, created_at desc);
create index if not exists wallet_topups_user_created_idx on public.wallet_topups(user_id, created_at desc);
