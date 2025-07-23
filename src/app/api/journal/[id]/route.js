import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import JournalEntry from '@/models/JournalEntry';

// GET - Fetch a specific journal entry
export async function GET(req, { params }) {
    try {
        const session = await getServerSession();
        
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        const entry = await JournalEntry.findOne({
            _id: params.id,
            userId: session.user.id
        });

        if (!entry) {
            return NextResponse.json(
                { message: 'Journal entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(entry);
    } catch (error) {
        console.error('Error fetching journal entry:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update a journal entry
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession();
        
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        const { title, content } = await req.json();

        if (!title || !content) {
            return NextResponse.json(
                { message: 'Title and content are required' },
                { status: 400 }
            );
        }

        const entry = await JournalEntry.findOneAndUpdate(
            {
                _id: params.id,
                userId: session.user.id
            },
            {
                title,
                content,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!entry) {
            return NextResponse.json(
                { message: 'Journal entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Journal entry updated successfully',
            entry
        });
    } catch (error) {
        console.error('Error updating journal entry:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a journal entry
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession();
        
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        const entry = await JournalEntry.findOneAndDelete({
            _id: params.id,
            userId: session.user.id
        });

        if (!entry) {
            return NextResponse.json(
                { message: 'Journal entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Journal entry deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 