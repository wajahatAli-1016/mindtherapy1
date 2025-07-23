import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import ChatbotConversation from '@/models/ChatbotConversation';
import { authOptions } from '../../auth/[...nextauth]/route';

// POST - End a conversation
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { conversationId } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ message: 'Conversation ID is required' }, { status: 400 });
    }

    const conversation = await ChatbotConversation.findOne({
      _id: conversationId,
      userId: session.user.id
    });

    if (!conversation) {
      return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
    }

    // End the conversation if it's still active
    if (conversation.isActive) {
      await conversation.endConversation();
    }

    return NextResponse.json({
      message: 'Conversation ended successfully'
    });

  } catch (error) {
    console.error('Error ending conversation:', error);
    return NextResponse.json(
      { message: 'Error ending conversation' },
      { status: 500 }
    );
  }
} 