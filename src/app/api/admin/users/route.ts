import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied: Super Admin privileges required.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        matchHistories: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    const safeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      phone: u.phone,
      role: u.role,
      balance: u.balance,
      totalDeposited: u.totalDeposited,
      totalWithdrawn: u.totalWithdrawn,
      vipTier: u.vipTier,
      isBanned: u.isBanned,
      gamesPlayed: u.gamesPlayed,
      gamesWon: u.gamesWon,
      totalWinnings: u.totalWinnings,
      createdAt: u.createdAt,
      recentMatches: u.matchHistories,
    }));

    return NextResponse.json({ users: safeUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
