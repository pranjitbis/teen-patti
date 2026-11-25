'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Users,
  Coins,
  TrendingUp,
  Wallet,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  PlusCircle,
  MinusCircle,
  Edit3,
  History,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  X,
  CreditCard,
  DollarSign,
  Crown,
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { soundManager } from '@/lib/sounds';

interface OverviewKPIs {
  totalUsers: number;
  totalDeposited: number;
  totalCirculation: number;
  platformRake: number;
  activePlayers: number;
  totalMatches: number;
}

interface UserRecord {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  vipTier: string;
  isBanned: boolean;
  gamesPlayed: number;
  gamesWon: number;
  totalWinnings: number;
  createdAt: string;
  recentMatches?: any[];
}

interface AuditLogRecord {
  id: string;
  admin: { name: string; username: string };
  targetUsername: string;
  action: string;
  previousBalance: number;
  newBalance: number;
  changeAmount: number;
  reason: string;
  createdAt: string;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [matchLogs, setMatchLogs] = useState<any[]>([]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'users' | 'investments' | 'audit' | 'matches'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Balance Adjustment Modal State
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [adjustAction, setAdjustAction] = useState<'ADD' | 'DEDUCT' | 'SET'>('ADD');
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [overviewRes, usersRes, logsRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/users'),
        fetch('/api/admin/logs'),
      ]);

      if (overviewRes.status === 403 || usersRes.status === 403) {
        showToast('error', 'Access Denied', 'Super Admin privileges required.');
        router.push('/lobby');
        return;
      }

      if (overviewRes.status === 401) {
        router.push('/login');
        return;
      }

      const overviewData = await overviewRes.json();
      const usersData = await usersRes.json();
      const logsData = await logsRes.json();

      setKpis(overviewData.kpis);
      setUsers(usersData.users || []);
      setAuditLogs(logsData.auditLogs || []);
      setMatchLogs(logsData.matchLogs || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser) return;
    const amountVal = parseFloat(adjustAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      showToast('error', 'Invalid Amount', 'Please specify a valid numeric amount');
      return;
    }

    setAdjustLoading(true);
    try {
      const res = await fetch('/api/admin/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          action: adjustAction,
          amount: amountVal,
          reason: adjustReason || `Super Admin manual ${adjustAction}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update balance');
      }

      soundManager.playWin();
      showToast(
        'success',
        'Balance Updated!',
        `${selectedUser.name}'s balance is now ₹${data.user.balance.toLocaleString('en-IN')}`
      );

      // Refresh data
      setSelectedUser(null);
      setAdjustAmount('');
      setAdjustReason('');
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Adjustment Failed', err.message);
    } finally {
      setAdjustLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b10] flex items-center justify-center text-purple-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold uppercase tracking-wider">Securing Admin Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06090d] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-purple-500/30 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white flex items-center gap-2 font-serif">
                SUPER ADMIN <span className="text-purple-400">COMMAND</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
                  LIVE CONTROL
                </span>
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Platform Vault & User Balance Authority
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/lobby"
              className="py-1.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-gold-400 text-gold-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Table Lobby
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Registered Users */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wider">
              <span>Total Registered Users</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white">{kpis?.totalUsers || 0}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {kpis?.activePlayers} Active Players in Database
            </div>
          </div>

          {/* Total Platform Investment / Deposits */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/30 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wider">
              <span>Total Platform Investment (₹)</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black font-mono text-emerald-300">
              ₹{kpis?.totalDeposited.toLocaleString('en-IN') || '0'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Cumulative real-money player deposits</div>
          </div>

          {/* Total Chips/Balance in Circulation */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-gold-950/20 to-slate-900 border border-gold-500/30 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wider">
              <span>Circulating Chip Supply</span>
              <Coins className="w-4 h-4 text-gold-400" />
            </div>
            <div className="text-3xl font-black font-mono text-gold-300">
              ₹{kpis?.totalCirculation.toLocaleString('en-IN') || '0'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Total active balance across all wallets</div>
          </div>

          {/* Platform Rake / House Margin */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wider">
              <span>Platform Rake Margin</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black font-mono text-indigo-300">
              ₹{kpis?.platformRake.toLocaleString('en-IN') || '0'}
            </div>
            <div className="text-[11px] text-purple-400 mt-1">Estimated 4.5% table commission</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> User Directory & Balance Control
            </button>

            <button
              onClick={() => setActiveTab('investments')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'investments'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" /> Investment Analytics
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Admin Audit Logs ({auditLogs.length})
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'matches'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Global Table Logs
            </button>
          </div>

          {/* Search Box */}
          {activeTab === 'users' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Tab 1: User & Balance Directory */}
        {activeTab === 'users' && (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Registered Users & Live Balances</h3>
                <p className="text-xs text-slate-400">
                  Click &ldquo;Adjust Balance&rdquo; to add, deduct, or override a player&apos;s bankroll in real-time.
                </p>
              </div>
              <span className="text-xs font-mono text-purple-300 bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-500/30">
                {filteredUsers.length} Users Found
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/30">
                    <th className="py-3.5 px-4">Player</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4 text-right">Current Balance</th>
                    <th className="py-3.5 px-4 text-right">Total Invested</th>
                    <th className="py-3.5 px-4 text-center">Record (W/L)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          {u.name}
                          {u.role === 'ADMIN' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-mono">{u.email}</div>
                        <div className="text-[11px] text-slate-500">{u.phone || '-'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-gold-300">
                        ₹{u.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-200">
                        ₹{u.totalDeposited.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="text-emerald-400 font-bold">{u.gamesWon}W</span> /{' '}
                        <span className="text-slate-400">{u.gamesPlayed - u.gamesWon}L</span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setAdjustAmount('');
                            setAdjustReason('');
                          }}
                          className="py-1.5 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Adjust Balance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Investment Analytics Breakdown */}
        {activeTab === 'investments' && (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Platform Investor Ledger</h3>
              <p className="text-xs text-slate-400">
                Detailed breakdown of user deposits, capital contributions, and platform liquidity share.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/30">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4 text-right">Total Invested (₹)</th>
                    <th className="py-3.5 px-4 text-right">Current Balance</th>
                    <th className="py-3.5 px-4 text-right">Pool Share</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users
                    .filter((u) => u.totalDeposited > 0)
                    .map((u) => {
                      const share = kpis?.totalDeposited
                        ? ((u.totalDeposited / kpis.totalDeposited) * 100).toFixed(1)
                        : 0;

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-300 text-sm">
                            ₹{u.totalDeposited.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-gold-300">
                            ₹{u.balance.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-purple-300 font-bold">
                            {share}%
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                              Active Investor
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Admin Audit Logs */}
        {activeTab === 'audit' && (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Super Admin Action Audit Log</h3>
              <p className="text-xs text-slate-400">
                Immutable record of all manual wallet adjustments, credits, debits, and balance overrides.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/30">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Admin</th>
                    <th className="py-3.5 px-4">Target User</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4 text-right">Adjustment</th>
                    <th className="py-3.5 px-4 text-right">New Balance</th>
                    <th className="py-3.5 px-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No manual balance adjustments logged yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-purple-300">
                          {log.admin?.name || 'Super Admin'}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          @{log.targetUsername}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-300">
                          {log.action}
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-mono font-bold ${
                            log.changeAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {log.changeAmount >= 0 ? `+₹${log.changeAmount}` : `-₹${Math.abs(log.changeAmount)}`}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-gold-300">
                          ₹{log.newBalance.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                          {log.reason}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Global Table Logs */}
        {activeTab === 'matches' && (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Global Teen Patti Hand History</h3>
              <p className="text-xs text-slate-400">
                Live stream of match settlements across all platform tables.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/30">
                    <th className="py-3.5 px-4">Time</th>
                    <th className="py-3.5 px-4">Player</th>
                    <th className="py-3.5 px-4">Table</th>
                    <th className="py-3.5 px-4">Result</th>
                    <th className="py-3.5 px-4">Hand Rank</th>
                    <th className="py-3.5 px-4 text-right">Pot Size</th>
                    <th className="py-3.5 px-4 text-right">Net Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {matchLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No matches recorded yet.
                      </td>
                    </tr>
                  ) : (
                    matchLogs.map((m) => {
                      const isWin = m.result === 'WIN';
                      return (
                        <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 text-slate-400 font-mono">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            {m.user?.name || 'Unknown'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">{m.tableName}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                isWin
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {m.result}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-gold-300">{m.handRank}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                            ₹{m.totalPot}
                          </td>
                          <td
                            className={`py-3.5 px-4 text-right font-mono font-bold ${
                              m.amountChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {m.amountChange >= 0 ? `+₹${m.amountChange}` : `-₹${Math.abs(m.amountChange)}`}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Manual Balance Control Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-2xl text-purple-300">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-serif">Manual Balance Adjustment</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Target: {selectedUser.name} (@{selectedUser.username})
                </p>
              </div>
            </div>

            {/* Current Balance Notice */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center mb-4">
              <span className="text-xs text-slate-400">Current Wallet Balance:</span>
              <span className="text-lg font-mono font-bold text-gold-300">
                ₹{selectedUser.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Adjustment Type Switcher */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setAdjustAction('ADD')}
                className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                  adjustAction === 'ADD'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" /> + Add
              </button>

              <button
                type="button"
                onClick={() => setAdjustAction('DEDUCT')}
                className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                  adjustAction === 'DEDUCT'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <MinusCircle className="w-3.5 h-3.5" /> - Deduct
              </button>

              <button
                type="button"
                onClick={() => setAdjustAction('SET')}
                className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                  adjustAction === 'SET'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Set Balance
              </button>
            </div>

            {/* Amount Field */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {adjustAction === 'SET' ? 'New Target Balance (₹)' : 'Amount (₹)'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-purple-400 font-bold">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-purple-400 rounded-xl text-white outline-none text-sm font-mono"
                />
              </div>
            </div>

            {/* Reason Field */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Audit Reason / Reference
              </label>
              <input
                type="text"
                placeholder="e.g. Promotional VIP Bonus, Manual correction"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-purple-400 rounded-xl text-white outline-none text-xs"
              />
            </div>

            <button
              onClick={handleAdjustBalance}
              disabled={adjustLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {adjustLoading ? 'Executing Adjustment...' : 'Confirm Balance Override'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
