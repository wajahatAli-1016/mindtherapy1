import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET - Get current session status
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find the most recent session for the user
    const currentSession = await Session.findOne({ 
      userId: session.user.id 
    }).sort({ startedAt: -1 });

    if (!currentSession) {
      return NextResponse.json({
        hasActiveSession: false,
        canChat: false,
        isActive: false,
        hasActivity: false,
        message: 'No sessions found'
      });
    }

    const canChat = currentSession.isActive && !currentSession.endedAt;
    const hasActivity = currentSession.messageLog && currentSession.messageLog.length > 0;

    return NextResponse.json({
      hasActiveSession: true,
      canChat,
      sessionId: currentSession._id,
      startedAt: currentSession.startedAt,
      endedAt: currentSession.endedAt,
      isActive: currentSession.isActive,
      hasActivity,
      activityCount: currentSession.messageLog ? currentSession.messageLog.length : 0,
      message: canChat ? 'Session is active, you can chat' : 'Session has ended, you can only read conversations'
    });

  } catch (error) {
    console.error('Error getting session status:', error);
    return NextResponse.json(
      { message: 'Error getting session status' },
      { status: 500 }
    );
  }
}

// POST - Start a new session
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // End any existing active sessions
    await Session.updateMany(
      { 
        userId: session.user.id, 
        isActive: true 
      },
      { 
        isActive: false, 
        endedAt: new Date() 
      }
    );

    // Create a new session
    const newSession = new Session({
      userId: session.user.id,
      isActive: true,
      startedAt: new Date()
    });

    await newSession.save();

    return NextResponse.json({
      message: 'New session started successfully',
      sessionId: newSession._id,
      startedAt: newSession.startedAt,
      canChat: true
    });

  } catch (error) {
    console.error('Error starting new session:', error);
    return NextResponse.json(
      { message: 'Error starting new session' },
      { status: 500 }
    );
  }
} 