import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const error = await req.json();
    
    // Log to server console
    console.error('🔴 CLIENT ERROR:', {
      message: error.message,
      stack: error.stack,
      url: error.url,
      line: error.line,
      column: error.column,
      userAgent: error.userAgent,
      timestamp: new Date(error.timestamp).toISOString()
    });
    
    // Could also write to file or database
    // fs.appendFileSync('/tmp/client-errors.log', JSON.stringify(error) + '\n');
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error logging client error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
