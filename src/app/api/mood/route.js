import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Mood from '../../../models/Mood';
import Session from '../../../models/Session';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        // Get query parameters for filtering
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 50;
        const page = parseInt(searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;

        // Fetch moods for the current user
        const moods = await Mood.find({ userId: session.user.id })
            .sort({ createdAt: -1 }) // Most recent first
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const totalMoods = await Mood.countDocuments({ userId: session.user.id });

        return NextResponse.json({
            moods,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMoods / limit),
                totalMoods,
                hasMore: page * limit < totalMoods
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching moods:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req){
    try{
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({message: 'Unauthorized'}, {status:401})
        }
        await connectDB();
        const {mood,intensity, note} = await req.json();
        const newMood = new Mood({
            userId: session.user.id,
            mood,
            intensity,
            note
        })
        await newMood.save();

        // Add to session if active session exists
        const activeSession = await Session.findOne({
            userId: session.user.id,
            isActive: true
        });

        if (activeSession) {
            await Session.findByIdAndUpdate(activeSession._id, {
                $push: {
                    messageLog: {
                        type: 'mood',
                        content: `Mood: ${mood} (Intensity: ${intensity}/10)`,
                        timestamp: new Date(),
                        metadata: {
                            moodId: newMood._id,
                            mood: mood,
                            intensity: intensity,
                            note: note
                        }
                    }
                }
            });
        }

        return NextResponse.json({message: 'Mood logged successfully'}, {status:201})
    }catch(error){
        console.error('Error logging mood:', error);
        return NextResponse.json({message: 'Internal server error'}, {status:500})
    }
}
