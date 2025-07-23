import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  return NextResponse.json({ 
    message: 'Chatbot API is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    return NextResponse.json({ 
      message: 'Test POST working',
      received: body,
      user: session.user.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      message: 'Test failed',
      error: error.message 
    }, { status: 500 });
  }
} 