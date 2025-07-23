import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import ChatbotConversation from '@/models/ChatbotConversation';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET - Retrieve conversation history
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Get specific conversation with all messages
      const conversation = await ChatbotConversation.findOne({
        _id: conversationId,
        userId: session.user.id
      }).populate('sessionId', 'startedAt endedAt');

      if (!conversation) {
        return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
      }

      return NextResponse.json({
        message: 'Conversation retrieved successfully',
        conversation
      });
    } else {
      // Get conversation list
      const skip = (page - 1) * limit;
      
      const conversations = await ChatbotConversation.find({ userId: session.user.id })
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('conversationTitle startedAt endedAt messages.length summary mood tags isActive')
        .populate('sessionId', 'startedAt endedAt');

      const total = await ChatbotConversation.countDocuments({ userId: session.user.id });

      return NextResponse.json({
        message: 'Conversation history retrieved successfully',
        conversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

  } catch (error) {
    console.error('Error retrieving conversation history:', error);
    return NextResponse.json(
      { message: 'Error retrieving conversation history' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a conversation
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ message: 'Conversation ID is required' }, { status: 400 });
    }

    const conversation = await ChatbotConversation.findOneAndDelete({
      _id: conversationId,
      userId: session.user.id
    });

    if (!conversation) {
      return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { message: 'Error deleting conversation' },
      { status: 500 }
    );
  }
} 