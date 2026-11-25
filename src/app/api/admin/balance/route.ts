import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied: Super Admin privileges required.' }, { status: 403 });
    }

    const { targetUserId, action, amount, reason } = await request.json();

    const changeAmount = parseFloat(amount);
    if (isNaN(changeAmount) || changeAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    let newBalance = targetUser.balance;
    let netDelta = 0;
    let transactionType = 'ADMIN_CREDIT';

    if (action === 'ADD') {
      newBalance = targetUser.balance + changeAmount;
      netDelta = changeAmount;
      transactionType = 'ADMIN_CREDIT';
    } else if (action === 'DEDUCT') {
      if (targetUser.balance < changeAmount) {
        return NextResponse.json(
          { error: `Cannot deduct ₹${changeAmount}. User only has ₹${targetUser.balance}` },
          { status: 400 }
        );
      }
      newBalance = targetUser.balance - changeAmount;
      netDelta = -changeAmount;
      transactionType = 'ADMIN_DEBIT';
    } else if (action === 'SET') {
      netDelta = changeAmount - targetUser.balance;
      newBalance = changeAmount;
      transactionType = netDelta >= 0 ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT';
    } else {
      return NextResponse.json({ error: 'Invalid action. Use ADD, DEDUCT, or SET' }, { status: 400 });
    }

    // Execute atomic balance update, audit log, and user transaction
    const [updatedUser, auditLog] = await prisma.$transaction([
      prisma.user.update({
        where: { id: targetUser.id },
        data: {
          balance: newBalance,
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId: session.userId,
          targetUserId: targetUser.id,
          targetUsername: targetUser.username,
          action: `MANUAL_BALANCE_${action}`,
          previousBalance: targetUser.balance,
          newBalance: newBalance,
          changeAmount: netDelta,
          reason: reason || `Admin manual ${action} adjustment`,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: targetUser.id,
          amount: netDelta,
          type: transactionType,
          balanceAfter: newBalance,
          description: reason || `Super Admin Balance Adjustment (${action})`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        balance: updatedUser.balance,
      },
      auditLog,
    });
  } catch (error: any) {
    console.error('Balance adjustment error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
