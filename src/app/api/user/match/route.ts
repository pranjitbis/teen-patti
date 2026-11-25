import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      tableName,
      bootAmount,
      totalPot,
      result, // 'WIN', 'LOSS', 'FOLD'
      amountChange, // positive for net win, negative for net lost
      cards,
      handRank,
      opponents,
    } = await request.json();

    const change = parseFloat(amountChange);
    if (isNaN(change)) {
      return NextResponse.json({ error: 'Invalid amount change' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if debiting more than available balance
    if (change < 0 && user.balance + change < 0) {
      return NextResponse.json({ error: 'Insufficient wallet balance for this wager' }, { status: 400 });
    }

    const newBalance = Math.max(0, user.balance + change);
    const isWin = result === 'WIN';

    const [updatedUser, matchRecord] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: newBalance,
          gamesPlayed: { increment: 1 },
          gamesWon: { increment: isWin ? 1 : 0 },
          totalWinnings: { increment: isWin && change > 0 ? change : 0 },
        },
      }),
      prisma.matchHistory.create({
        data: {
          userId: user.id,
          tableName: tableName || 'Teen Patti Table',
          bootAmount: parseFloat(bootAmount) || 10,
          totalPot: parseFloat(totalPot) || 0,
          result: result || 'LOSS',
          amountChange: change,
          cardsJson: JSON.stringify(cards || []),
          handRank: handRank || 'High Card',
          opponents: opponents || 'Opponents',
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          amount: change,
          type: isWin ? 'GAME_WIN' : 'GAME_BET',
          balanceAfter: newBalance,
          description: isWin
            ? `Won pot on ${tableName} (${handRank})`
            : `Hand settlement on ${tableName}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      balance: updatedUser.balance,
      matchId: matchRecord.id,
    });
  } catch (error: any) {
    console.error('Match record error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
