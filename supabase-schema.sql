-- Token data witnesses
create table token_witnesses (
  id uuid default gen_random_uuid() primary key,
  token_ca text not null,
  supply numeric,
  holders integer,
  commitment text not null unique,
  shards jsonb not null,
  rdfa text not null,
  witnessed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies
alter table token_witnesses enable row level security;

-- Public can read token data
create policy "Public can view token witnesses"
  on token_witnesses for select
  using (true);

-- Only authenticated users can insert
create policy "Authenticated can create witnesses"
  on token_witnesses for insert
  with check (auth.role() = 'authenticated');

-- ZK Badge storage with selective disclosure
create table zk_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  commitment text not null unique,
  wallet_address text,
  holdings bigint,
  shards jsonb not null,
  rdfa text not null,
  
  -- Selective disclosure masks
  reveal_wallet boolean default false,
  reveal_holdings boolean default false,
  reveal_identity boolean default false,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies
alter table zk_badges enable row level security;

-- Users can read their own badges
create policy "Users can view own badges"
  on zk_badges for select
  using (auth.uid() = user_id);

-- Users can insert their own badges
create policy "Users can create badges"
  on zk_badges for insert
  with check (auth.uid() = user_id);

-- Users can update their own disclosure settings
create policy "Users can update own badges"
  on zk_badges for update
  using (auth.uid() = user_id);

-- Public can view badges with selective disclosure
create policy "Public can view badges"
  on zk_badges for select
  using (true);

-- Function to get badge with selective disclosure
create or replace function get_badge_public(badge_commitment text)
returns jsonb as $$
declare
  badge_data jsonb;
begin
  select jsonb_build_object(
    'commitment', commitment,
    'wallet', case when reveal_wallet then wallet_address else null end,
    'holdings', case when reveal_holdings then holdings else null end,
    'identity', case when reveal_identity then user_id else null end,
    'rdfa', rdfa,
    'created_at', created_at
  )
  into badge_data
  from zk_badges
  where commitment = badge_commitment;
  
  return badge_data;
end;
$$ language plpgsql security definer;

-- Ownership proofs table
create table ownership_proofs (
  id uuid default gen_random_uuid() primary key,
  wallet text not null,
  role text not null,
  message text not null,
  signature text not null,
  commitment text not null unique,
  verified_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies
alter table ownership_proofs enable row level security;

-- Public can read ownership proofs
create policy "Public can view ownership proofs"
  on ownership_proofs for select
  using (true);

-- Only authenticated users can insert
create policy "Authenticated can create proofs"
  on ownership_proofs for insert
  with check (auth.role() = 'authenticated');

-- Indexes
create index idx_ownership_proofs_wallet on ownership_proofs(wallet);
create index idx_ownership_proofs_commitment on ownership_proofs(commitment);
