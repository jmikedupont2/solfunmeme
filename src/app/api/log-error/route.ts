import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const error = await req.json();
    
    // Log to server console with prominent marker
    console.log('\n' + '='.repeat(80));
    console.error('🔴 CLIENT ERROR RECEIVED:');
    console.error('  Message:', error.message);
    console.error('  URL:', error.url);
    console.error('  Line:', error.line, 'Column:', error.column);
    console.error('  User Agent:', error.userAgent);
    console.error('  Timestamp:', new Date(error.timestamp).toISOString());
    if (error.stack) {
      console.error('  Stack:', error.stack);
    }
    console.log('='.repeat(80) + '\n');
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error logging client error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
