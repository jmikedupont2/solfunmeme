import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface ZKBadge {
  id?: string;
  user_id?: string;
  commitment: string;
  wallet_address?: string;
  holdings?: number;
  shards: any[];
  rdfa: string;
  reveal_wallet: boolean;
  reveal_holdings: boolean;
  reveal_identity: boolean;
  created_at?: string;
}

export async function saveBadge(badge: ZKBadge) {
  const { data, error } = await supabase
    .from('zk_badges')
    .insert([badge])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getBadge(commitment: string) {
  const { data, error } = await supabase
    .rpc('get_badge_public', { badge_commitment: commitment });
  
  if (error) throw error;
  return data;
}

export async function updateDisclosure(
  commitment: string,
  disclosure: {
    reveal_wallet?: boolean;
    reveal_holdings?: boolean;
    reveal_identity?: boolean;
  }
) {
  const { data, error } = await supabase
    .from('zk_badges')
    .update(disclosure)
    .eq('commitment', commitment)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('zk_badges')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
