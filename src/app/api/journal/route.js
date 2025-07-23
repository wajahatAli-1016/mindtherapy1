import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import JournalEntry from '@/models/JournalEntry';
import Session from '@/models/Session';
import { authOptions } from '../auth/[...nextauth]/route';

// GET - Fetch all journal entries for the authenticated user
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        const entries = await JournalEntry.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .select('-__v');

        return NextResponse.json(entries);
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create a new journal entry
export async function POST(req) {
    try {
        console.log('Journal POST request received');
        const session = await getServerSession(authOptions);
        console.log('Session:', session);
        
        if (!session) {
            console.log('No session found');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        const { title, content, mood } = await req.json();

        if (!title || !content) {
            return NextResponse.json(
                { message: 'Title and content are required' },
                { status: 400 }
            );
        }

                       // Create the journal entry
               const newEntry = new JournalEntry({
                   userId: session.user.id,
                   title,
                   content,
                   mood: mood || 3
               });

               // Save the entry
               await newEntry.save();

               // Add to session if active session exists
               const activeSession = await Session.findOne({
                   userId: session.user.id,
                   isActive: true
               });

               if (activeSession) {
                   await Session.findByIdAndUpdate(activeSession._id, {
                       $push: {
                           messageLog: {
                               type: 'journal',
                               content: `Journal Entry: ${title}`,
                               timestamp: new Date(),
                               metadata: {
                                   entryId: newEntry._id,
                                   mood: mood || 3,
                                   contentLength: content.length
                               }
                           }
                       }
                   });
               }

        return NextResponse.json(
            { message: 'Journal entry created successfully', entry: newEntry },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating journal entry:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 