import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import { authOptions } from '../../auth/[...nextauth]/route';

// POST - Add message to session
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { id: sessionId } = params;
    const { type, content, metadata = {} } = await req.json();

    if (!type || !content) {
      return NextResponse.json(
        { message: 'Type and content are required' },
        { status: 400 }
      );
    }

    // Validate message type
    const validTypes = ['journal', 'mood', 'feedback'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { message: 'Invalid message type' },
        { status: 400 }
      );
    }

    // Find and update the session
    const activeSession = await Session.findOneAndUpdate(
      { 
        _id: sessionId, 
        userId: session.user.id, 
        isActive: true 
      },
      {
        $push: {
          messageLog: {
            type,
            content,
            timestamp: new Date(),
            metadata
          }
        }
      },
      { new: true }
    );

    if (!activeSession) {
      return NextResponse.json(
        { message: 'Active session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Message added to session successfully',
      session: activeSession
    });

  } catch (error) {
    console.error('Error adding message to session:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 