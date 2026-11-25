'use client';

import React from 'react';

interface ChipStackProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ChipStack: React.FC<ChipStackProps> = ({
  amount,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  // Determine chip style based on value
  const getChipColor = (val: number) => {
    if (val >= 1000) return 'from-purple-700 via-purple-600 to-indigo-900 border-purple-400 text-purple-200';
    if (val >= 500) return 'from-amber-600 via-amber-500 to-yellow-700 border-amber-300 text-yellow-100';
    if (val >= 100) return 'from-emerald-700 via-emerald-600 to-teal-800 border-emerald-400 text-emerald-100';
    if (val >= 50) return 'from-blue-700 via-blue-600 to-cyan-800 border-blue-400 text-blue-100';
    return 'from-rose-700 via-rose-600 to-red-800 border-rose-400 text-rose-100';
  };

  const chipSize = {
    sm: 'w-7 h-7 text-[9px] border',
    md: 'w-10 h-10 text-xs border-2',
    lg: 'w-12 h-12 text-sm border-2',
  }[size];

  // Number of visual stacked chips
  const count = Math.min(4, Math.max(1, Math.floor(Math.log10(amount || 10))));
  const colorClass = getChipColor(amount);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center" style={{ height: `${size === 'lg' ? 52 : size === 'md' ? 44 : 32}px` }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full shadow-lg bg-gradient-to-br ${colorClass} flex items-center justify-center font-bold tracking-tight select-none transition-transform`}
            style={{
              width: size === 'lg' ? 48 : size === 'md' ? 40 : 28,
              height: size === 'lg' ? 48 : size === 'md' ? 40 : 28,
              bottom: `${i * 3}px`,
            }}
          >
            {/* Chip Inner Ring */}
            <div className="w-4/5 h-4/5 rounded-full border border-dashed border-white/50 flex items-center justify-center bg-black/20">
              {i === count - 1 && (
                <span className="font-extrabold text-[10px] md:text-xs drop-shadow">
                  ₹{amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {showLabel && (
        <span className="mt-1 font-mono font-bold text-xs md:text-sm text-gold-300 drop-shadow flex items-center gap-0.5">
          ₹{amount.toLocaleString('en-IN')}
        </span>
      )}
    </div>
  );
};
