'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  User,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Phone,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  const handleLoginSubmit = async (e?: React.FormEvent, customIdent?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const finalIdent = customIdent || identifier;
    const finalPass = customPass || password;

    if (!finalIdent || !finalPass) {
      showToast('error', 'Missing Information', 'Please enter your email/username and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: finalIdent, password: finalPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      showToast('success', 'Welcome Back!', `Logged in as ${data.user.name}`);

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/lobby');
      }
      router.refresh();
    } catch (err: any) {
      showToast('error', 'Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !identifier || !password) {
      showToast('error', 'Required Fields', 'Please complete all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username,
          email: identifier,
          phone,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      showToast('success', 'Account Created!', 'Enjoy your ₹5,000 welcome chips bonus!');
      router.push('/lobby');
      router.refresh();
    } catch (err: any) {
      showToast('error', 'Registration Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = (ident: string, pass: string) => {
    setIdentifier(ident);
    setPassword(pass);
    handleLoginSubmit(undefined, ident, pass);
  };

  return (
    <div className="min-h-screen bg-[#05080c] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Lighting Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        
        {/* Left Side: Client Demo Presentation & Instant 1-Click Credentials */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-gold-500/20 backdrop-blur-xl shadow-2xl">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
                <span className="text-slate-950 text-2xl font-black font-serif">♠</span>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white font-serif">
                  TEEN PATTI <span className="text-gold-400">ROYALE</span>
                </h1>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                  Client Demo Suite <Flame className="w-3 h-3 text-amber-500" />
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Welcome to the professional Teen Patti real-stakes platform demo. Experience seamless gameplay, strict wallet balance checks, and the full Super Admin financial management center.
            </p>

            {/* Quick Demo Credentials Box */}
            <div className="mb-6">
              <div className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> Pre-Seeded Demo Logins
              </div>

              {/* Super Admin Demo Card */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 mb-3 hover:border-purple-400/60 transition-all group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-purple-400" /> Super Admin
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30">
                    Full Control
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-mono mb-2">
                  admin@teenpatti.com / <span className="text-slate-400">admin123</span>
                </div>
                <button
                  type="button"
                  onClick={() => fillAndLogin('admin@teenpatti.com', 'admin123')}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all active:scale-[0.98]"
                >
                  <span>1-Click Super Admin Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Test Player Demo Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400/60 transition-all group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-400" /> Test Player (Rohit S.)
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                    ₹15,450 Balance
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-mono mb-2">
                  player@teenpatti.com / <span className="text-slate-400">player123</span>
                </div>
                <button
                  type="button"
                  onClick={() => fillAndLogin('player@teenpatti.com', 'player123')}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
                >
                  <span>1-Click Player Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Compliance & Security Badges */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" /> Certified RNG Logic
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" /> 256-bit Wallet Security
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" /> Live INR Accounting
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" /> Real-Time Rake & Log
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col justify-center">
          {/* Tab Switcher */}
          <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 mb-8">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                !isRegister
                  ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                isRegister
                  ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={isRegister ? handleRegisterSubmit : (e) => handleLoginSubmit(e)} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Vikram Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-gold-400 rounded-xl text-white outline-none text-sm transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Username</label>
                    <input
                      type="text"
                      placeholder="vikram99"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-gold-400 rounded-xl text-white outline-none text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Phone (Optional)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-gold-400 rounded-xl text-white outline-none text-sm transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {isRegister ? 'Email Address' : 'Email Address or Username'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={isRegister ? 'email' : 'text'}
                  placeholder={isRegister ? 'vikram@example.com' : 'admin@teenpatti.com or username'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-gold-400 rounded-xl text-white outline-none text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Password</label>
                {!isRegister && (
                  <span className="text-[11px] text-gold-400/80">Demo: admin123 / player123</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-800 focus:border-gold-400 rounded-xl text-white outline-none text-sm transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>New accounts automatically receive a ₹5,000 real-stakes welcome wallet bonus.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-gold-500 via-amber-500 to-yellow-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-gold-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Cloud DB...</span>
                </div>
              ) : (
                <>
                  <span>{isRegister ? 'Complete Registration' : 'Enter Casino Table'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
