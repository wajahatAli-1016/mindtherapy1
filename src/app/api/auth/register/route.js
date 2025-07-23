import {NextResponse} from 'next/server';
import bcrypt from 'bcrypt';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req){
    try{
      console.log('Registration request received');
      await connectDB();
      console.log('Database connected');
      
      const body = await req.json();
      console.log('Request body:', body);
      
      const {name,email,password} = body;

      if(!name || !email || !password){
        console.log('Missing fields:', {name: !!name, email: !!email, password: !!password});
        return NextResponse.json({message:'All fields are required'},{status:400});
      }

      console.log('Checking for existing user with email:', email);
      const existingUser = await User.findOne({email});
      if(existingUser){
        console.log('User already exists');
        return NextResponse.json({message:'User already exists'},{status:400});
      }

      console.log('Hashing password');
      const hashedPassword = await bcrypt.hash(password,10);
      const newUser = new User({name,email,password:hashedPassword});
      
      console.log('Saving user to database');
      // Save the user to the database
      await newUser.save();
      console.log('User saved successfully');
      
      return NextResponse.json(
        {message:'User registered successfully'},
        {status:201}
      );

    }catch(error){
        console.log('Registration error:', error);
        return NextResponse.json(
          {message:'Internal server error', error: error.message},
          {status:500}
        );
    }
}