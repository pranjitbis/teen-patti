import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idVal = body.identifier || body.emailOrUsername || body.email || body.username;
    const password = body.password;

    if (!idVal || !password) {
      return NextResponse.json({ error: 'Please provide email/username and password' }, { status: 400 });
    }

    const cleanIdent = idVal.toLowerCase().trim();

    // Query user with auto-retry if connection was cold
    let user;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanIdent },
            { username: cleanIdent },
          ],
        },
      });
    } catch (initialErr: any) {
      console.warn('[Login] DB connection retry due to:', initialErr.message);
      await prisma.$connect().catch(() => {});
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanIdent },
            { username: cleanIdent },
          ],
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials. User not found.' }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'This account has been suspended by the administrator.' }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password. Please check your credentials.' }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role as 'PLAYER' | 'ADMIN',
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
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    const msg = error?.message || '';
    if (msg.includes('Timed out') || msg.includes('Can\'t reach') || msg.includes('connection')) {
      return NextResponse.json(
        { error: 'Cloud database is waking up. Please click Login once more.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Authentication error. Please try again.' },
      { status: 500 }
    );
  }
}
