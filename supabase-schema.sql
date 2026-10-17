-- IP26 PRODUCTION PORTAL | SUPABASE REALTIME INVENTORY SCHEMA
-- Database: PostgreSQL (Supabase)
-- Realtime: Enabled for instant bi-directional mobile sync

-- 1. Create table for inventory items status
create table if not exists public.inventory_items (
  item_id text primary key,
  vendor text not null,
  item_name text not null,
  loaded boolean default false,
  loaded_by text default '',
  loaded_at timestamptz,
  packed boolean default false,
  packed_by text default '',
  packed_at timestamptz,
  updated_at timestamptz default timezone('utc'::text, now())
);

-- 2. Create index for fast vendor queries
create index if not exists idx_inventory_vendor on public.inventory_items(vendor);

-- 3. Enable Row Level Security (RLS)
alter table public.inventory_items enable row level security;

-- 4. Create RLS policies for anonymous crew access (No login barrier during production)
drop policy if exists "Allow public read access" on public.inventory_items;
create policy "Allow public read access" 
  on public.inventory_items 
  for select 
  to anon, authenticated 
  using (true);

drop policy if exists "Allow public insert/update access" on public.inventory_items;
drop policy if exists "Allow public insert access" on public.inventory_items;
drop policy if exists "Allow public update access" on public.inventory_items;

create policy "Allow public insert access" 
  on public.inventory_items 
  for insert 
  to anon, authenticated 
  with check (true);

create policy "Allow public update access" 
  on public.inventory_items 
  for update 
  to anon, authenticated 
  using (true) 
  with check (true);

-- Note: DELETE is strictly restricted to service_role to prevent accidental inventory loss

-- 5. Enable Realtime Replication for table
alter publication supabase_realtime add table public.inventory_items;

-- 6. Trigger to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_inventory_updated_at on public.inventory_items;
create trigger set_inventory_updated_at
  before update on public.inventory_items
  for each row
  execute function public.handle_updated_at();
