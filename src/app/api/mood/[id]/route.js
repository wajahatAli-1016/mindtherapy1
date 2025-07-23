import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import connectDB from '@/lib/db'
import Mood from '@/models/Mood'
import { authOptions } from '../../auth/[...nextauth]/route';
<<<<<<< HEAD
=======

>>>>>>> c2d60777e502327d1436da562ac217603f653cbe

export async function GET(req){
    try{
      const session = getServerSession();
      if(!session) {
        return NextResponse({message:'Unauthorized'},{status:401});
      }
      await connectDB();
      const entries = await Mood.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .select('-__v');

        return NextResponse.json(entries);
    }
    catch(error){
        console.log('Error fetching moods',error)
        return NextResponse({message:'Internal server error'}, {status:500});
    }
}
