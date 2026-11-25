import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tables = await prisma.gameTable.findMany({
      where: { active: true },
      orderBy: { bootAmount: 'asc' },
    });

    return NextResponse.json({ tables });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
