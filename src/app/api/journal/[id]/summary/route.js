import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import JournalEntry from '@/models/JournalEntry';
import Session from '@/models/Session';
import { generateJournalFeedback } from '@/lib/groqAI';
import { authOptions } from '../../../auth/[...nextauth]/route';

// Function to generate AI feedback using Groq API
async function generateAIFeedback(title, content, mood) {
    try {
        return await generateJournalFeedback(title, content, mood);
    } catch (error) {
        console.error('Error generating AI feedback:', error);
        throw error;
    }
}

// POST - Generate hardcoded summary for a specific journal entry
export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        const { id } =await params;
        
        // Find the journal entry and verify ownership
        const entry = await JournalEntry.findOne({ 
            _id: id, 
            userId: session.user.id 
        });

        if (!entry) {
            return NextResponse.json(
                { message: 'Journal entry not found' },
                { status: 404 }
            );
        }

        // Generate AI feedback using Groq API
        const summary = await generateAIFeedback(entry.title, entry.content, entry.mood);

        // Update the entry with the new summary
        const updatedEntry = await JournalEntry.findByIdAndUpdate(
            id,
            { aiSummary: summary },
            { new: true }
        );

        // Add feedback to session and end session
        const activeSession = await Session.findOne({
            userId: session.user.id,
            isActive: true
        });

        if (activeSession) {
            // Add feedback message to session
            await Session.findByIdAndUpdate(activeSession._id, {
                $push: {
                    messageLog: {
                        type: 'feedback',
                        content: `Feedback received for: ${entry.title}`,
                        timestamp: new Date(),
                        metadata: {
                            entryId: entry._id,
                            summary: summary,
                            mood: entry.mood
                        }
                    }
                }
            });

            // End the session
            await Session.findByIdAndUpdate(activeSession._id, {
                isActive: false,
                endedAt: new Date()
            });
        }

        return NextResponse.json({
            message: 'AI feedback generated successfully',
            summary: summary,
            entry: updatedEntry,
            sessionEnded: activeSession ? true : false
        });

    } catch (error) {
        console.error('Error generating AI feedback:', error);
        
        return NextResponse.json(
            { message: 'Error generating AI feedback. Please try again.' },
            { status: 500 }
        );
    }
} 