create sequence if not exists public.order_code_seq
  as bigint
  start with 900000000000000
  increment by 1
  minvalue 900000000000000
  maxvalue 999999999999999
  cache 1;

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
