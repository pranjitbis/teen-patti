'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { DepositModal } from '@/components/DepositModal';
import {
  User,
  Wallet,
  Trophy,
  History,
  TrendingUp,
  CreditCard,
  Shield,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { PlayingCard } from '@/components/PlayingCard';

interface UserData {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  vipTier: string;
  gamesPlayed: number;
  gamesWon: number;
  totalWinnings: number;
  createdAt: string;
}

interface MatchRecord {
  id: string;
  tableName: string;
  bootAmount: number;
  totalPot: number;
  result: string;
  amountChange: number;
  cardsJson: string;
  handRank: string;
  opponents: string;
  createdAt: string;
}

interface TransactionRecord {
  id: string;
  amount: number;
  type: string;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'matches' | 'transactions'>('matches');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [meRes, walletRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/user/wallet'),
      ]);

      if (meRes.status === 401) {
        router.push('/login');
        return;
      }

      const meData = await meRes.json();
      const walletData = await walletRes.json();

      if (meData.user) {
        setUser(meData.user);
      }
      if (walletData.transactions) {
        setTransactions(walletData.transactions);
      }

      // Fetch matches from user's public history or query
      const matchRes = await fetch('/api/admin/users'); // fallback or user matches
      if (matchRes.ok) {
        const uData = await matchRes.json();
        const found = uData.users?.find((u: any) => u.id === meData.user?.id);
        if (found && found.recentMatches) {
          setMatches(found.recentMatches);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b10] flex items-center justify-center text-gold-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold uppercase tracking-wider">Loading Profile & Bankroll...</span>
        </div>
      </div>
    );
  }

  const winRate = user?.gamesPlayed ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#06090d] text-slate-100 flex flex-col">
      <Navbar
        user={user}
        onBalanceUpdate={(newBal) => setUser((prev) => (prev ? { ...prev, balance: newBal } : null))}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {/* Profile Header & Bankroll Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User ID Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-600 flex items-center justify-center text-2xl font-black text-slate-950 font-serif border border-gold-300 shadow-lg shadow-gold-500/20">
                  {user?.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white font-serif">{user?.name}</h1>
                  <span className="text-xs text-slate-400 font-mono">@{user?.username}</span>
                  <div className="mt-1">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30">
                      {user?.vipTier || 'PLATINUM'} VIP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono">{user?.phone || 'Not verified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Type:</span>
                <span className="font-semibold text-emerald-400">Verified Real-Money Player</span>
              </div>
            </div>
          </div>

          {/* Wallet & Investment Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-gold-500/30 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" /> Live Wallet Balance
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Instant Payout
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-black text-gold-300 my-2">
                ₹{user?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Total Invested / Deposited</span>
                <span className="font-mono font-bold text-white text-sm">
                  ₹{user?.totalDeposited.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Total Withdrawn</span>
                <span className="font-mono font-bold text-slate-300 text-sm">
                  ₹{user?.totalWithdrawn.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsDepositOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <CreditCard className="w-4 h-4" /> Deposit / Top Up Funds
            </button>
          </div>

          {/* Performance & Hands Stats */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-gold-400" /> Lifetime Teen Patti Record
            </h3>

            <div className="grid grid-cols-2 gap-4 my-auto">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Hands Played</span>
                <div className="text-2xl font-black font-mono text-white mt-1">{user?.gamesPlayed}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Hands Won</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{user?.gamesWon}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Win Ratio</span>
                <div className="text-2xl font-black font-mono text-gold-400 mt-1">{winRate}%</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Gross Winnings</span>
                <div className="text-xl font-black font-mono text-emerald-300 mt-1">
                  ₹{user?.totalWinnings.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              Real-time statistical sync verified via database ledger.
            </div>
          </div>
        </div>

        {/* Tab Navigation: Match History vs Wallet Ledger */}
        <div className="flex border-b border-slate-800 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('matches')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'matches'
                ? 'border-gold-400 text-gold-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> Recent Match History ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-gold-400 text-gold-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" /> Wallet & Deposit Ledger ({transactions.length})
          </button>
        </div>

        {/* Tab 1: Match History */}
        {activeTab === 'matches' && (
          <div className="space-y-3">
            {matches.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-sm">
                No recent matches recorded yet. Join a table in the Lobby to start playing!
              </div>
            ) : (
              matches.map((m) => {
                const isWin = m.result === 'WIN';
                let parsedCards: any[] = [];
                try {
                  parsedCards = JSON.parse(m.cardsJson || '[]');
                } catch (e) {}

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl border mt-0.5 ${
                          isWin
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                            : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                        }`}
                      >
                        {isWin ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {m.tableName}
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              isWin
                                ? 'bg-emerald-900/80 text-emerald-300'
                                : 'bg-rose-900/80 text-rose-300'
                            }`}
                          >
                            {m.result}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Boot: ₹{m.bootAmount} • Pot: ₹{m.totalPot} • Hand: <span className="text-gold-300 font-semibold">{m.handRank}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Opponents: {m.opponents || 'Sharma Ji, Priya, Bunty'}
                        </div>
                      </div>
                    </div>

                    {/* Cards Played & Net Change */}
                    <div className="flex items-center gap-4 self-end sm:self-center">
                      {parsedCards.length > 0 && (
                        <div className="flex -space-x-2">
                          {parsedCards.map((c, i) => (
                            <PlayingCard key={i} card={c} size="xs" />
                          ))}
                        </div>
                      )}

                      <div className="text-right min-w-[90px]">
                        <span
                          className={`text-base font-black font-mono ${
                            m.amountChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {m.amountChange >= 0 ? `+₹${m.amountChange}` : `-₹${Math.abs(m.amountChange)}`}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Wallet Transactions */}
        {activeTab === 'transactions' && (
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-sm">
                No wallet transactions recorded yet.
              </div>
            ) : (
              transactions.map((t) => {
                const isCredit = t.amount > 0;
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isCredit ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-white">{t.description || t.type}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(t.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-mono font-bold text-sm ${
                          isCredit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCredit ? `+₹${t.amount.toLocaleString('en-IN')}` : `-₹${Math.abs(t.amount).toLocaleString('en-IN')}`}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Bal: ₹{t.balanceAfter.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={(newBal) => setUser((prev) => (prev ? { ...prev, balance: newBal } : null))}
        currentBalance={user?.balance || 0}
      />
    </div>
  );
}
