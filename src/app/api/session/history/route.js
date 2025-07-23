import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET - Fetch session history for user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    // Fetch sessions for the current user
    const sessions = await Session.find({ userId: session.user.id })
      .sort({ startedAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalSessions = await Session.countDocuments({ userId: session.user.id });

    return NextResponse.json({
      sessions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSessions / limit),
        totalSessions,
        hasMore: page * limit < totalSessions
      }
    });

  } catch (error) {
    console.error('Error fetching session history:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 