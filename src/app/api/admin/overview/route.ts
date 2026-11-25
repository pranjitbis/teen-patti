import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied: Super Admin privileges required.' }, { status: 403 });
    }

    const totalUsers = await prisma.user.count();

    const sumDeposits = await prisma.user.aggregate({
      _sum: {
        totalDeposited: true,
        balance: true,
        totalWinnings: true,
      },
    });

    const totalDeposited = sumDeposits._sum.totalDeposited || 0;
    const totalCirculation = sumDeposits._sum.balance || 0;

    // Platform rake estimate (5% of wagers or total games * standard rake)
    const totalMatches = await prisma.matchHistory.count();
    const platformRake = Math.round(totalDeposited * 0.045);

    // Active players
    const activePlayers = await prisma.user.count({
      where: {
        isBanned: false,
      },
    });

    // Investment breakdown table (all users who deposited)
    const investors = await prisma.user.findMany({
      orderBy: { totalDeposited: 'desc' },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        balance: true,
        totalDeposited: true,
        gamesPlayed: true,
        gamesWon: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      kpis: {
        totalUsers,
        totalDeposited,
        totalCirculation,
        platformRake,
        activePlayers,
        totalMatches,
      },
      investors,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
