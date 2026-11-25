'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Coins,
  Shield,
  User as UserIcon,
  LogOut,
  PlusCircle,
  Volume2,
  VolumeX,
  Menu,
  X,
  Flame,
  Crown,
  Trophy,
  BookOpen,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { DepositModal } from './DepositModal';
import { soundManager } from '../lib/sounds';

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    username: string;
    balance: number;
    role: string;
    vipTier?: string;
  } | null;
  onBalanceUpdate?: (newBalance: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user: initialUser, onBalanceUpdate }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(initialUser);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync prop changes or fetch fresh if not provided
  useEffect(() => {
    if (initialUser !== undefined) {
      setUser(initialUser);
    } else {
      fetch('/api/auth/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.user) setUser(data.user);
          else setUser(null);
        })
        .catch(() => setUser(null));
    }
  }, [initialUser, pathname]);

  const handleSoundToggle = () => {
    const nextState = soundManager.toggleSound();
    setSoundOn(nextState);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDepositSuccess = (newBalance: number) => {
    setUser((prev: any) => (prev ? { ...prev, balance: newBalance } : null));
    if (onBalanceUpdate) {
      onBalanceUpdate(newBalance);
    }
  };

  if (pathname === '/login') return null;

  return (
    <>
      {/* 1. Top Announcement & Content Ticker */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-950 to-emerald-950 border-b border-gold-500/20 text-gold-300 text-[11px] py-1.5 px-4 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar font-medium">
            <span className="flex items-center gap-1 text-amber-400 font-bold uppercase tracking-wider bg-amber-500/20 px-2 py-0.2 rounded-full border border-amber-500/40 text-[9px]">
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" /> LIVE CASINO
            </span>
            <span className="text-slate-300">
              ⚡ <strong className="text-gold-200">24x7 Instant UPI Withdrawals</strong> under 15 mins
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline">
              🏆 <strong className="text-amber-300">₹10,000 Max Table Pot Cap</strong> enforced
            </span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="text-slate-400 hidden md:inline">
              🔒 100% Certified RNG Deck Shuffling
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-slate-400 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> 1,480 Active Players
            </span>
            <span>•</span>
            <span className="text-slate-400">🔞 18+ Responsible Gaming</span>
          </div>
        </div>
      </div>

      {/* 2. Main Executive Casino Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-gold-500/20 px-4 lg:px-8 py-2.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform border border-gold-300/80">
              <span className="text-slate-950 text-xl font-black font-serif">♠</span>
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-serif leading-none">
                TEEN PATTI <span className="text-gold-400">ROYALE</span>
              </div>
              <div className="text-[10px] text-gold-400/80 uppercase tracking-widest font-semibold flex items-center gap-1 mt-0.5">
                Official Real-Stakes Arena <Crown className="w-2.5 h-2.5 text-amber-400" />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                pathname === '/' || pathname === '/lobby'
                  ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Teen Patti Tables
            </Link>

            <Link
              href="/#rankings"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-1"
            >
              <Trophy className="w-3.5 h-3.5 text-gold-400" />
              Hand Rankings
            </Link>

            <Link
              href="/#rules"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Rules & Pot Cap
            </Link>

            {user && (
              <Link
                href="/profile"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                  pathname === '/profile'
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                Profile & Wallet
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                    : 'text-purple-300 hover:bg-purple-950/40 border border-purple-500/20'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Super Admin
              </Link>
            )}
          </nav>

          {/* Right Side: Balance / Actions */}
          <div className="flex items-center gap-2.5">
            {/* Sound FX Toggle */}
            <button
              onClick={handleSoundToggle}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-gold-400 transition-colors"
              title={soundOn ? 'Sound On' : 'Sound Off'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-gold-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {user ? (
              <>
                {/* Live Balance Pill (Opens Deposit Modal) */}
                <div
                  onClick={() => setIsDepositOpen(true)}
                  className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-gold-500/40 hover:border-gold-400 transition-all shadow-md hover:shadow-gold-500/10"
                >
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-slate-400 uppercase font-semibold leading-none">Wallet</span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-gold-300 group-hover:text-gold-200">
                      ₹{user.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="ml-1 p-1 rounded-lg bg-gold-500 text-slate-950 hover:bg-gold-400 transition-colors"
                    title="Deposit Funds"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Role Pill & Profile */}
                <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="text-right">
                    <div className="text-xs font-bold text-white leading-tight">{user.name}</div>
                    <span
                      className={`inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                          : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {user.role === 'ADMIN' ? 'Super Admin' : user.vipTier || 'VIP Player'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* If NOT Logged In: Strict Sign In / Register CTAs */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-amber-500 to-yellow-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-gold-500/20 transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2 animate-fadeIn">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-bold text-gold-300 bg-gold-500/10"
            >
              ♠ Teen Patti Tables
            </Link>
            <Link
              href="/#rankings"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900"
            >
              🏆 Hand Rankings Guide
            </Link>
            <Link
              href="/#rules"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900"
            >
              📖 How to Play & ₹10,000 Pot Cap
            </Link>
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900"
                >
                  👤 Profile & Wallet History
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-purple-300 bg-purple-950/40"
                  >
                    👑 Super Admin Command Center
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsDepositOpen(true);
                  }}
                  className="text-left px-3 py-2 rounded-lg text-xs font-bold text-gold-400 hover:bg-slate-900 flex items-center gap-2"
                >
                  <Coins className="w-4 h-4" /> Deposit Funds (UPI / NetBanking)
                </button>
                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-slate-900 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout ({user.name})
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 font-black text-xs uppercase"
              >
                Sign In / Register to Play
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Deposit Modal */}
      {user && (
        <DepositModal
          isOpen={isDepositOpen}
          onClose={() => setIsDepositOpen(false)}
          onSuccess={handleDepositSuccess}
          currentBalance={user.balance || 0}
        />
      )}
    </>
  );
};
