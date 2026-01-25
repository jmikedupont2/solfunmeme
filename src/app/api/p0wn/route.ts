import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY.' 
      }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { wallet, message, signature, role, timestamp } = await req.json();

    // Verify signature
    const publicKey = new PublicKey(wallet);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    
    const verified = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );

    if (!verified) {
      return NextResponse.json({ success: false, error: 'Invalid signature' });
    }

    // Create commitment
    const commitment = crypto
      .createHash('sha256')
      .update(`${wallet}:${timestamp}:${role}`)
      .digest('base64url');

    // Store ownership proof
    const { data: proof, error: proofError } = await supabase
      .from('ownership_proofs')
      .insert({
        wallet,
        role,
        message,
        signature,
        commitment,
        verified_at: new Date(timestamp).toISOString()
      })
      .select()
      .single();

    if (proofError) throw proofError;

    // Create developer badge
    const { data: badge, error: badgeError } = await supabase
      .from('zk_badges')
      .insert({
        commitment,
        wallet_address: wallet,
        token_holdings: '0',
        badge_type: 'developer',
        show_wallet: true,
        show_holdings: false,
        show_identity: true,
        metadata: {
          role,
          verified: true,
          signature,
          timestamp
        }
      })
      .select()
      .single();

    if (badgeError) throw badgeError;

    return NextResponse.json({
      success: true,
      badge: {
        id: badge.id,
        wallet,
        role,
        commitment,
        timestamp
      }
    });

  } catch (error: any) {
    console.error('P0WN error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
