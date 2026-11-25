'use client';

import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';
import { useToast } from './Toast';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
  currentBalance: number;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentBalance,
}) => {
  const [amount, setAmount] = useState<number>(1000);
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [loading, setLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  const handleDeposit = async () => {
    if (amount < 100) {
      showToast('error', 'Minimum Deposit is ₹100');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          type: 'DEPOSIT',
          method,
          description: `Instant Deposit via ${method.toUpperCase()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to deposit');
      }

      showToast('success', 'Deposit Successful!', `₹${amount.toLocaleString('en-IN')} added to your wallet.`);
      onSuccess(data.balance);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      showToast('error', 'Deposit Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-gold-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-gold-300 flex items-center gap-2">
              <Zap className="w-5 h-5 text-gold-400 fill-gold-400" />
              Deposit Funds
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Instant credit to real-money gaming wallet</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Display */}
        <div className="my-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">Current Balance:</span>
          <span className="font-mono font-bold text-lg text-emerald-400">
            ₹{currentBalance.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Amount Selection */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Amount (₹ INR)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold font-mono border transition-all ${
                  amount === q
                    ? 'bg-gold-500/20 border-gold-400 text-gold-300 shadow-md ring-1 ring-gold-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                ₹{q.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-gold-400">
              ₹
            </span>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Or enter custom amount"
              className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 focus:border-gold-400 focus:outline-none font-mono text-sm"
              min={100}
              max={100000}
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Payment Gateway
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'upi', label: 'UPI / QR', icon: '⚡' },
              { id: 'card', label: 'Debit/Credit', icon: '💳' },
              { id: 'netbanking', label: 'Net Banking', icon: '🏛️' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id as 'upi' | 'card' | 'netbanking')}
                className={`p-2.5 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                  method === m.id
                    ? 'bg-gold-500/15 border-gold-400 text-gold-200'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-base">{m.icon}</span>
                <span className="font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Safety & Action */}
        <div className="flex items-center gap-2 text-emerald-400/90 text-xs mb-5 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/50">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>256-Bit SSL Encrypted Instant Payment Simulation</span>
        </div>

        <button
          onClick={handleDeposit}
          disabled={loading || amount <= 0}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-gold-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-base shadow-lg shadow-gold-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Confirm Deposit of ₹{amount.toLocaleString('en-IN')}
              <ArrowUpRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
