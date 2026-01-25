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
