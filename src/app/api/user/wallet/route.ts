import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      balance: user.balance,
      totalDeposited: user.totalDeposited,
      totalWithdrawn: user.totalWithdrawn,
      transactions: user.transactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, method } = await request.json();
    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount < 100) {
      return NextResponse.json({ error: 'Minimum deposit amount is ₹100' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newBalance = user.balance + depositAmount;
    const newDeposited = user.totalDeposited + depositAmount;

    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: newBalance,
          totalDeposited: newDeposited,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          amount: depositAmount,
          type: 'DEPOSIT',
          balanceAfter: newBalance,
          description: `Deposit via ${method || 'Instant UPI'}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      balance: updatedUser.balance,
      transaction,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
