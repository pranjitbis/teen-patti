const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking Teen Patti Gaming Platform database seed...');

  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log(`Database already has ${userCount} users. Seed already present. Skipping.`);
    return;
  }

  // Clear existing
  await prisma.auditLog.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.matchHistory.deleteMany({});
  await prisma.gameTable.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPass = await bcrypt.hash('admin123', 10);
  const playerPass = await bcrypt.hash('player123', 10);

  // 1. Super Admin
  const admin = await prisma.user.create({
    data: {
      username: 'superadmin',
      name: 'Vikramaditya (Super Admin)',
      email: 'admin@teenpatti.com',
      phone: '+91 98765 43210',
      passwordHash: adminPass,
      role: 'ADMIN',
      balance: 100000.0,
      totalDeposited: 100000.0,
      totalWithdrawn: 0.0,
      avatar: 'avatar-admin',
      vipTier: 'DIAMOND',
      gamesPlayed: 14,
      gamesWon: 11,
      totalWinnings: 42000.0,
    },
  });

  // 2. Demo Test Player
  const player = await prisma.user.create({
    data: {
      username: 'rohit_sharma',
      name: 'Rohit Sharma',
      email: 'player@teenpatti.com',
      phone: '+91 91234 56789',
      passwordHash: playerPass,
      role: 'PLAYER',
      balance: 15450.0,
      totalDeposited: 15000.0,
      totalWithdrawn: 2000.0,
      avatar: 'avatar-1',
      vipTier: 'PLATINUM',
      gamesPlayed: 28,
      gamesWon: 17,
      totalWinnings: 2450.0,
    },
  });

  // 3. Other Seed Players
  const p2 = await prisma.user.create({
    data: {
      username: 'priya_patel',
      name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+91 99887 76655',
      passwordHash: playerPass,
      role: 'PLAYER',
      balance: 28500.0,
      totalDeposited: 30000.0,
      totalWithdrawn: 5000.0,
      avatar: 'avatar-2',
      vipTier: 'DIAMOND',
      gamesPlayed: 52,
      gamesWon: 34,
      totalWinnings: 18500.0,
    },
  });

  const p3 = await prisma.user.create({
    data: {
      username: 'kabir_mehta',
      name: 'Kabir Mehta',
      email: 'kabir@example.com',
      phone: '+91 97766 55443',
      passwordHash: playerPass,
      role: 'PLAYER',
      balance: 8200.0,
      totalDeposited: 10000.0,
      totalWithdrawn: 1000.0,
      avatar: 'avatar-3',
      vipTier: 'GOLD',
      gamesPlayed: 19,
      gamesWon: 8,
      totalWinnings: 3200.0,
    },
  });

  const p4 = await prisma.user.create({
    data: {
      username: 'ananya_roy',
      name: 'Ananya Roy',
      email: 'ananya@example.com',
      phone: '+91 96655 44332',
      passwordHash: playerPass,
      role: 'PLAYER',
      balance: 54000.0,
      totalDeposited: 50000.0,
      totalWithdrawn: 12000.0,
      avatar: 'avatar-4',
      vipTier: 'DIAMOND',
      gamesPlayed: 88,
      gamesWon: 59,
      totalWinnings: 38000.0,
    },
  });

  const p5 = await prisma.user.create({
    data: {
      username: 'arjun_verma',
      name: 'Arjun Verma',
      email: 'arjun@example.com',
      phone: '+91 95544 33221',
      passwordHash: playerPass,
      role: 'PLAYER',
      balance: 4200.0,
      totalDeposited: 5000.0,
      totalWithdrawn: 0.0,
      avatar: 'avatar-5',
      vipTier: 'SILVER',
      gamesPlayed: 12,
      gamesWon: 4,
      totalWinnings: 1200.0,
    },
  });

  // Seed Transactions for Test Player
  await prisma.transaction.createMany({
    data: [
      {
        userId: player.id,
        amount: 10000.0,
        type: 'DEPOSIT',
        balanceAfter: 10000.0,
        description: 'Initial Wallet UPI Deposit',
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
      {
        userId: player.id,
        amount: 5000.0,
        type: 'DEPOSIT',
        balanceAfter: 15000.0,
        description: 'Net Banking Top-up',
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        userId: player.id,
        amount: -50.0,
        type: 'GAME_BET',
        balanceAfter: 14950.0,
        description: 'Boot fee: Mumbai High Stakes',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        userId: player.id,
        amount: 550.0,
        type: 'GAME_WIN',
        balanceAfter: 15500.0,
        description: 'Won Pot (Pure Sequence)',
        createdAt: new Date(Date.now() - 86400000 * 2 + 300000),
      },
      {
        userId: player.id,
        amount: -50.0,
        type: 'GAME_BET',
        balanceAfter: 15450.0,
        description: 'Boot fee: Mumbai High Stakes',
        createdAt: new Date(Date.now() - 3600000),
      },
    ],
  });

  // Seed Transactions for other players
  await prisma.transaction.createMany({
    data: [
      {
        userId: p2.id,
        amount: 30000.0,
        type: 'DEPOSIT',
        balanceAfter: 30000.0,
        description: 'Direct Bank Transfer',
        createdAt: new Date(Date.now() - 86400000 * 7),
      },
      {
        userId: p4.id,
        amount: 50000.0,
        type: 'DEPOSIT',
        balanceAfter: 50000.0,
        description: 'Credit Card Deposit',
        createdAt: new Date(Date.now() - 86400000 * 10),
      },
      {
        userId: p3.id,
        amount: 10000.0,
        type: 'DEPOSIT',
        balanceAfter: 10000.0,
        description: 'Instant UPI Payment',
        createdAt: new Date(Date.now() - 86400000 * 4),
      },
      {
        userId: p5.id,
        amount: 5000.0,
        type: 'DEPOSIT',
        balanceAfter: 5000.0,
        description: 'PayTM Wallet Top-up',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
    ],
  });

  // Seed Match Histories
  await prisma.matchHistory.createMany({
    data: [
      {
        userId: player.id,
        tableName: 'Mumbai High Stakes',
        bootAmount: 50.0,
        totalPot: 600.0,
        result: 'WIN',
        amountChange: 550.0,
        cardsJson: JSON.stringify([
          { suit: 'hearts', rank: 'A', value: 14 },
          { suit: 'hearts', rank: 'K', value: 13 },
          { suit: 'hearts', rank: 'Q', value: 12 },
        ]),
        handRank: 'Pure Sequence',
        opponents: 'Sharma Ji, Priya, Bunty',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        userId: player.id,
        tableName: 'Mumbai High Stakes',
        bootAmount: 50.0,
        totalPot: 400.0,
        result: 'LOSS',
        amountChange: -100.0,
        cardsJson: JSON.stringify([
          { suit: 'spades', rank: 'J', value: 11 },
          { suit: 'diamonds', rank: 'J', value: 11 },
          { suit: 'clubs', rank: '5', value: 5 },
        ]),
        handRank: 'Pair',
        opponents: 'Vikram, Bunty',
        createdAt: new Date(Date.now() - 86400000 * 1.5),
      },
      {
        userId: player.id,
        tableName: 'Goa Casino Club',
        bootAmount: 10.0,
        totalPot: 120.0,
        result: 'WIN',
        amountChange: 110.0,
        cardsJson: JSON.stringify([
          { suit: 'diamonds', rank: '9', value: 9 },
          { suit: 'diamonds', rank: '8', value: 8 },
          { suit: 'diamonds', rank: '7', value: 7 },
        ]),
        handRank: 'Pure Sequence',
        opponents: 'Meera, Raja, Bunty',
        createdAt: new Date(Date.now() - 86400000 * 1),
      },
    ],
  });

  // Seed Admin Audit Log
  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      targetUserId: player.id,
      targetUsername: player.username,
      action: 'BALANCE_ADJUSTMENT',
      previousBalance: 15000.0,
      newBalance: 15450.0,
      changeAmount: 450.0,
      reason: 'VIP Promotional Cashback Bonus',
      createdAt: new Date(Date.now() - 86400000),
    },
  });

  // Seed Game Tables
  await prisma.gameTable.createMany({
    data: [
      {
        name: 'Goa Casino Club',
        tier: 'Novice Club',
        bootAmount: 10.0,
        minBalance: 50.0,
        maxBet: 200.0,
        maxPlayers: 6,
        active: true,
      },
      {
        name: 'Mumbai High Stakes',
        tier: 'Challenger Suite',
        bootAmount: 50.0,
        minBalance: 250.0,
        maxBet: 1000.0,
        maxPlayers: 6,
        active: true,
      },
      {
        name: 'Delhi Royal Lounge',
        tier: 'High Roller Den',
        bootAmount: 200.0,
        minBalance: 1000.0,
        maxBet: 5000.0,
        maxPlayers: 6,
        active: true,
      },
      {
        name: 'Macau Platinum VIP',
        tier: 'Royale VIP',
        bootAmount: 1000.0,
        minBalance: 5000.0,
        maxBet: 25000.0,
        maxPlayers: 6,
        active: true,
      },
    ],
  });

  console.log('✅ Seeding complete!');
  console.log('Super Admin: admin@teenpatti.com / admin123');
  console.log('Test Player: player@teenpatti.com / player123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
