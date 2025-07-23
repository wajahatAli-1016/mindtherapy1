import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import ChatbotConversation from '@/models/ChatbotConversation';
import { authOptions } from '../auth/[...nextauth]/route';

const GROQ_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Check if API key is configured
if (!GROQ_API_KEY) {
  console.warn('GROQ API key not configured. Set OPENAI_API_KEY environment variable.');
}

// Generate AI response for chatbot conversation
async function generateChatbotResponse(message, conversationHistory) {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured');
    }

    const systemPrompt = `You are a compassionate and supportive AI therapy assistant. Your role is to provide thoughtful, empathetic responses in a conversational manner.

Guidelines:
- Be warm, supportive, and encouraging
- Listen actively and respond to the user's emotional state
- Provide gentle insights and observations
- Keep responses conversational and natural (2-4 sentences)
- Focus on emotional support and validation
- Ask follow-up questions when appropriate
- Avoid giving medical advice
- Use a caring, therapeutic tone
- Maintain conversation flow and context

Remember: You're having a real-time conversation, so be responsive and engaging.`;

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: messages,
        max_tokens: 400,
        temperature: 0.7,
        top_p: 0.9,
      }),
      // Add timeout and retry options
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from Groq API');
    }

    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error('Error generating chatbot response:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError' || error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      throw new Error('AI service is temporarily unavailable. Please try again in a moment.');
    } else if (error.message.includes('fetch failed')) {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (!GROQ_API_KEY) {
      throw new Error('AI service is not configured. Please contact support.');
    }
    
    throw error;
  }
}

// POST - Handle chatbot conversation
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user has an active session
    const activeSession = await Session.findOne({
      userId: session.user.id,
      isActive: true
    });

    if (!activeSession) {
      return NextResponse.json({
        message: 'No active session found',
        error: 'SESSION_REQUIRED',
        canChat: false
      }, { status: 403 });
    }

    const { message, conversationHistory = [], conversationId = null } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { message: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate AI response
    let aiResponse;
    try {
      aiResponse = await generateChatbotResponse(message, conversationHistory);
    } catch (error) {
      console.error('AI response generation failed:', error);
      
      // Return a helpful error message
      return NextResponse.json({
        message: 'AI response generation failed',
        response: error.message || "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        error: 'AI_SERVICE_ERROR'
      });
    }

    // Use the active session we already found
    const sessionId = activeSession._id;

    // Get or create chatbot conversation
    let conversation;
    if (conversationId) {
      conversation = await ChatbotConversation.findById(conversationId);
      if (!conversation || conversation.userId !== session.user.id) {
        return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
      }
    } else {
      // Create new conversation
      conversation = new ChatbotConversation({
        userId: session.user.id,
        sessionId: sessionId,
        conversationTitle: `Chatbot Conversation - ${new Date().toLocaleDateString()}`,
        startedAt: new Date()
      });
      await conversation.save();
    }

    // Add messages to conversation
    await conversation.addMessage('user', message, {
      conversationLength: conversationHistory.length + 1
    });
    
    await conversation.addMessage('assistant', aiResponse, {
      conversationLength: conversationHistory.length + 2,
      responseTime: new Date()
    });

    // Update session with chatbot activity
    await Session.findByIdAndUpdate(sessionId, {
      $push: {
        messageLog: {
          type: 'chatbot',
          content: `Chatbot Conversation: ${message.substring(0, 50)}...`,
          timestamp: new Date(),
          metadata: {
            conversationId: conversation._id,
            userMessage: message,
            aiResponse: aiResponse,
            conversationLength: conversationHistory.length + 2
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Chatbot response generated successfully',
      response: aiResponse,
      conversationId: conversation._id
    });

  } catch (error) {
    console.error('Error in chatbot API:', error);
    
    // Fallback response
    const fallbackResponse = "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or feel free to continue with your journaling or mood tracking.";
    
    return NextResponse.json({
      message: 'Error generating response',
      response: fallbackResponse
    });
  }
} 