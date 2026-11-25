'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { PlayingCard } from '@/components/PlayingCard';
import { DepositModal } from '@/components/DepositModal';
import {
  Flame,
  Shield,
  Coins,
  Trophy,
  Users,
  ArrowRight,
  Sparkles,
  Lock,
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  HelpCircle,
  X,
  CreditCard,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { soundManager } from '@/lib/sounds';
import { useToast } from '@/components/Toast';

interface Table {
  id: string;
  name: string;
  tier: string;
  bootAmount: number;
  minBalance: number;
  maxBet: number;
  maxPlayers: number;
}

export default function HomePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedTableForAuth, setSelectedTableForAuth] = useState<Table | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, tablesRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/tables'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
        } else {
          setUser(null);
        }

        if (tablesRes.ok) {
          const tData = await tablesRes.json();
          setTables(tData.tables || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleTableClick = (table: Table) => {
    // STRICT AUTHENTICATION ENFORCEMENT: No guest play!
    if (!user) {
      soundManager.playFold();
      setSelectedTableForAuth(table);
      setAuthModalOpen(true);
      return;
    }

    // Check minimum balance
    if (user.balance < table.bootAmount) {
      soundManager.playFold();
      showToast(
        'error',
        'Insufficient Bankroll',
        `You need at least ₹${table.bootAmount} (Boot Amount) to join ${table.name}. Please deposit funds.`
      );
      setIsDepositOpen(true);
      return;
    }

    soundManager.playTurnAlert();
    router.push(`/game/${table.id}`);
  };

  const sampleAceHand: any[] = [
    { suit: 'spades', rank: 'A', value: 14 },
    { suit: 'spades', rank: 'K', value: 13 },
    { suit: 'spades', rank: 'Q', value: 12 },
  ];

  return (
    <div className="min-h-screen bg-[#06090d] text-slate-100 flex flex-col selection:bg-gold-500 selection:text-slate-950">
      <Navbar
        user={user}
        onBalanceUpdate={(newBal) => setUser((prev: any) => (prev ? { ...prev, balance: newBal } : null))}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* HERO SECTION: Teen Patti Grand Arena */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 border border-gold-500/30 p-6 md:p-12 mb-10 shadow-2xl">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Dedicated Real-Stakes 3-Card Poker Arena
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-serif tracking-tight leading-tight mb-3">
                Play Pure <span className="text-gold-400">Teen Patti</span> With Real Bankrolls
              </h1>

              <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
                Experience authentic real-money style Teen Patti tables. Authentic card rankings,
                procedural casino audio, live ₹ INR bankroll enforcement, and strict <strong className="text-amber-300">₹10,000 Table Pot Caps</strong> for guaranteed fair play.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                {user ? (
                  <button
                    onClick={() => {
                      if (tables.length > 0) handleTableClick(tables[1] || tables[0]);
                    }}
                    className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-gold-500 via-amber-500 to-yellow-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-gold-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    Enter Live Table Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-gold-500 via-amber-500 to-yellow-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-gold-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    Login / Register to Play
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                <a
                  href="#rankings"
                  className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-gold-400" /> Hand Rankings
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Certified RNG Shuffling
                </span>
                <span className="flex items-center gap-1 text-gold-300 font-medium">
                  <Zap className="w-4 h-4 text-gold-400" /> Instant 15-Min UPI Withdrawals
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Shield className="w-4 h-4 text-slate-400" /> 18+ Responsible Gaming
                </span>
              </div>
            </div>

            {/* Right Interactive Table Felt Preview */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-sm rounded-3xl p-5 bg-gradient-to-b from-[#0a4025] to-[#042615] border-4 border-[#855b25] shadow-2xl relative flex flex-col items-center text-center">
                <div className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-black/60 text-gold-400 border border-gold-400/40 mb-3 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-gold-400" /> Live Arena Preview
                </div>

                {/* Hand cards fan */}
                <div className="flex gap-1.5 mb-3 shadow-2xl">
                  {sampleAceHand.map((c, i) => (
                    <PlayingCard key={i} card={c} size="md" highlighted={true} />
                  ))}
                </div>

                <div className="font-serif font-black text-sm text-gold-300">
                  Pure Sequence (A-K-Q ♠)
                </div>
                <div className="text-[11px] text-emerald-300 font-mono mt-0.5">
                  Unbeatable 3-Card Royal Flush
                </div>

                <div className="w-full mt-4 p-3 rounded-xl bg-black/60 border border-gold-500/30 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Current Table Pot:</span>
                  <span className="text-gold-300 font-bold text-sm">₹4,850 / ₹10,000 Cap</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RECENT BIG WINNERS MARQUEE */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3 mb-10 overflow-hidden shadow-md">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex-shrink-0 font-extrabold uppercase tracking-wider text-gold-400 flex items-center gap-1 bg-gold-500/10 px-2.5 py-1 rounded-lg border border-gold-500/20">
              <Trophy className="w-3.5 h-3.5" /> Recent Winners
            </span>
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-slate-300">
              <span>🎉 <strong>Rohit Sharma</strong> won ₹3,400 with <em>Pure Sequence</em></span>
              <span className="text-slate-600">•</span>
              <span>👑 <strong>Priya Patel</strong> won ₹8,200 with <em>Trail of Kings</em></span>
              <span className="text-slate-600">•</span>
              <span>🔥 <strong>Vikram Singh</strong> won ₹2,100 with <em>Color Flush</em></span>
              <span className="text-slate-600">•</span>
              <span>✨ <strong>Ananya Roy</strong> won ₹6,500 with <em>Sequence</em></span>
            </div>
          </div>
        </div>

        {/* SECTION: TEEN PATTI TABLE STAKES SELECTOR */}
        <section id="tables" className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-2xl font-black text-white font-serif flex items-center gap-2">
                Teen Patti Live Stakes <Flame className="w-5 h-5 text-amber-500" />
              </h2>
              <p className="text-xs text-slate-400">
                Pick your preferred boot stakes. Strict ₹10,000 pot cap enforced to ensure disciplined real-stakes gameplay.
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full self-start">
              Game: <strong className="text-gold-400 font-serif">Classic Teen Patti</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tables.map((table, idx) => {
              const hasEnough = user ? user.balance >= table.bootAmount : false;
              const isVip = table.bootAmount >= 200;

              return (
                <div
                  key={table.id}
                  className={`rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between relative group ${
                    isVip
                      ? 'bg-gradient-to-b from-slate-900 via-purple-950/20 to-slate-900 border-purple-500/40 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/10'
                      : 'bg-slate-900/90 border-slate-800 hover:border-gold-500/40 hover:shadow-xl hover:shadow-gold-500/10'
                  }`}
                >
                  <div>
                    {/* Header Pill */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isVip
                            ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                            : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {table.tier}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{idx === 0 ? '4/6' : idx === 1 ? '5/6' : idx === 2 ? '3/6' : '2/6'} Players</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-gold-300 transition-colors font-serif">
                      {table.name}
                    </h3>

                    {/* Boot & Pot Cap Specs */}
                    <div className="my-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-xs text-slate-400">Boot Amount:</span>
                        <span className="text-xl font-black font-mono text-gold-400">
                          ₹{table.bootAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-400">Table Pot Cap:</span>
                        <span className="text-emerald-400 font-mono font-bold">₹10,000 (Forced Show)</span>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min Entry Bankroll:</span>
                        <span className="font-mono font-semibold">₹{table.minBalance.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Max Chaal Bet:</span>
                        <span className="font-mono font-semibold">₹{table.maxBet.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Play Action Button */}
                  <button
                    onClick={() => handleTableClick(table)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 via-amber-500 to-yellow-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    {!user ? (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Login to Play
                      </>
                    ) : hasEnough ? (
                      <>
                        Join Table
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Wallet className="w-3.5 h-3.5" /> Deposit & Join
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION: OFFICIAL HAND RANKINGS GUIDE */}
        <section id="rankings" className="mb-12 rounded-3xl bg-slate-900/70 border border-slate-800 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-gold-400" />
            <h2 className="text-xl font-bold text-white font-serif">
              Official Teen Patti Hand Rankings
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Hands evaluated from highest to lowest according to standard international rules.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-gold-500/30">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gold-300 text-sm">1. Trail / Trio (Set)</span>
                <span className="text-[10px] uppercase font-mono font-bold text-gold-400 bg-gold-500/20 px-2 py-0.5 rounded">Highest</span>
              </div>
              <p className="text-xs text-slate-300">Three cards of the identical rank.</p>
              <div className="text-[11px] text-slate-400 font-mono mt-2">Example: A♠ A♥ A♦ (AAA is unbeatable)</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-300 text-sm">2. Pure Sequence (Straight Flush)</span>
              </div>
              <p className="text-xs text-slate-300">Three consecutive cards of the same suit.</p>
              <div className="text-[11px] text-slate-400 font-mono mt-2">Example: A♥ K♥ Q♥ or 4♠ 3♠ 2♠</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-blue-300 text-sm">3. Sequence / Run (Straight)</span>
              </div>
              <p className="text-xs text-slate-300">Three consecutive cards of mixed suits.</p>
              <div className="text-[11px] text-slate-400 font-mono mt-2">Example: A♠ K♥ Q♦ or 9♣ 8♠ 7♦</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-purple-300 text-sm">4. Color / Flush</span>
              </div>
              <p className="text-xs text-slate-300">All three cards of the same suit, not consecutive.</p>
              <div className="text-[11px] text-slate-400 font-mono mt-2">Example: K♦ 9♦ 4♦</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-amber-300 text-sm">5. Pair</span>
              </div>
              <p className="text-xs text-slate-300">Two cards of equal rank and one kicker.</p>
              <div className="text-[11px] text-slate-400 font-mono mt-2">Example: J♠ J♥ 5♦</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-300 text-sm">6. High Card</span>
              </div>
              <p className="text-xs text-slate-300">Highest single card when no other combination is formed.</p>
              <div className="text-[11px] text-slate-400 font-mono mt-2">Example: A♠ 10♦ 6♣ (Ace High)</div>
            </div>
          </div>
        </section>

        {/* SECTION: RULES & ₹10,000 POT CAP BREAKDOWN */}
        <section id="rules" className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-base font-bold text-white font-serif mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gold-400" />
              How Teen Patti Gameplay Works
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                <div>
                  <strong className="text-white">Boot Collection:</strong> Every player pays the predetermined table boot to seed the central pot before cards are dealt.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                <div>
                  <strong className="text-white">Blind vs Seen (Chaal):</strong> Players can bet Blind (1x cost) without looking at their cards, or click "See Cards" and bet Chaal (2x cost).
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                <div>
                  <strong className="text-white">Showdown / Show Cards:</strong> When 2 players remain, either player can call for a Show. Both cards are revealed and the higher hand takes the entire pot.
                </div>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/30 to-slate-900 border border-amber-500/30">
            <h3 className="text-base font-bold text-amber-300 font-serif mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              ₹10,000 Table Pot Cap Rule
            </h3>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              To promote responsible gaming and prevent runaway pot escalations, our platform enforces an absolute maximum pot limit of <strong>₹10,000</strong>.
            </p>
            <div className="p-3.5 rounded-2xl bg-black/60 border border-amber-500/20 text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Automatic Forced Showdown at ₹10k
              </div>
              <p className="text-[11px] text-slate-400">
                Whenever total wagers push the pot to ₹10,000, betting is immediately locked and a forced showdown is executed. All active cards are exposed, and the winner claims the ₹10,000 pot.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* AUTH REQUIRED MODAL: strictly blocks guests from table play */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-gold-500/40 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl relative text-white">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center mx-auto mb-4 text-gold-400">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-white font-serif mb-1">
              Sign In to Join Real Cash Tables
            </h3>

            <p className="text-xs text-slate-400 mb-6">
              To preserve fair play, certified bankroll enforcement, and real ₹ payouts, guest viewing and unauthenticated gameplay are strictly disabled.
            </p>

            {selectedTableForAuth && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-6 text-left flex justify-between items-center">
                <span className="text-slate-400">Selected Table:</span>
                <span className="font-bold text-gold-300">{selectedTableForAuth.name} (Boot ₹{selectedTableForAuth.bootAmount})</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <Link
                href="/login"
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 via-amber-500 to-yellow-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2"
              >
                Sign In to Your Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase transition-colors"
              >
                Register & Claim ₹5,000 Bonus
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={(newBal) => setUser((prev: any) => (prev ? { ...prev, balance: newBal } : null))}
        currentBalance={user?.balance || 0}
      />
    </div>
  );
}
