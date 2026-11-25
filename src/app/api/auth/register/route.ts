import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, username, email, phone, password } = await request.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Initial sign-up bonus of ₹2,500
    const user = await prisma.user.create({
      data: {
        name,
        username: cleanUsername,
        email: cleanEmail,
        phone: phone || null,
        passwordHash,
        role: 'PLAYER',
        balance: 5000.0,
        totalDeposited: 5000.0,
        vipTier: 'BRONZE',
        transactions: {
          create: {
            amount: 5000.0,
            type: 'DEPOSIT',
            balanceAfter: 5000.0,
            description: 'Welcome Bonus & Initial Deposit',
          },
        },
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: 'PLAYER',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance,
      },
    });

    response.cookies.set('tp_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
