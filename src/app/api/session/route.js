import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import { authOptions } from '../auth/[...nextauth]/route';

// GET - Fetch active session for user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const activeSession = await Session.findOne({
      userId: session.user.id,
      isActive: true
    }).sort({ startedAt: -1 });

    if (!activeSession) {
      return NextResponse.json({ 
        message: 'No active session found',
        hasActiveSession: false 
      });
    }

    return NextResponse.json({
      message: 'Active session found',
      session: activeSession,
      hasActiveSession: true
    });

  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new session
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // End any existing active session
    await Session.updateMany(
      { userId: session.user.id, isActive: true },
      { isActive: false, endedAt: new Date() }
    );

    // Create new session
    const newSession = new Session({
      userId: session.user.id,
      messageLog: [],
      startedAt: new Date(),
      isActive: true
    });

    await newSession.save();

    return NextResponse.json({
      message: 'Session created successfully',
      session: newSession
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - End active session
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Session ID is required' },
        { status: 400 }
      );
    }

    const activeSession = await Session.findOneAndUpdate(
      { 
        _id: sessionId, 
        userId: session.user.id, 
        isActive: true 
      },
      { 
        isActive: false, 
        endedAt: new Date() 
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
      message: 'Session ended successfully',
      session: activeSession
    });

  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 