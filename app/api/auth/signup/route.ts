import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      role: role || 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const token = await createToken({
      userId: result.insertedId.toString(),
      email,
      role: role || 'customer',
    });

    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: result.insertedId,
          email,
          name,
          role: role || 'customer',
        },
      },
      { status: 201 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, 
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
