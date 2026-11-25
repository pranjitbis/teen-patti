'use client';

import React from 'react';
import { Card, Suit } from '@/lib/gameEngine';

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  highlighted?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  faceDown = false,
  size = 'md',
  highlighted = false,
  className = '',
  onClick,
}) => {
  const sizeStyles = {
    sm: { w: 'w-10 sm:w-11', h: 'h-14 sm:h-16', rank: 'text-[10px] sm:text-xs', icon: 'w-3 h-3', center: 'w-5 h-5' },
    md: { w: 'w-14 sm:w-16', h: 'h-20 sm:h-24', rank: 'text-xs sm:text-sm', icon: 'w-3.5 h-3.5', center: 'w-7 h-7' },
    lg: { w: 'w-18 sm:w-20', h: 'h-26 sm:h-28', rank: 'text-sm sm:text-base', icon: 'w-4 h-4', center: 'w-9 h-9' },
  }[size];

  // If face down, render luxury royal card back
  if (faceDown || !card) {
    return (
      <div
        onClick={onClick}
        className={`${sizeStyles.w} ${sizeStyles.h} rounded-lg bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border-2 border-gold-500/70 shadow-lg relative flex items-center justify-center p-1 select-none transform transition-transform hover:-translate-y-1 ${
          highlighted ? 'ring-2 ring-gold-400 shadow-gold-500/50' : ''
        } ${className}`}
      >
        {/* Ornate Card Back Pattern */}
        <div className="w-full h-full rounded border border-gold-400/40 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:6px_6px] flex items-center justify-center">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gold-400/60 bg-blue-900/80 flex items-center justify-center text-gold-300 font-serif font-black text-[10px] sm:text-xs shadow">
            ♠
          </div>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const textColor = isRed ? 'text-rose-600' : 'text-slate-900';

  const suitSymbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };

  const suitSymbol = suitSymbols[card.suit];

  return (
    <div
      onClick={onClick}
      className={`${sizeStyles.w} ${sizeStyles.h} rounded-lg bg-white border border-slate-300 shadow-md relative flex flex-col justify-between p-1 select-none transform transition-all duration-300 hover:-translate-y-1 ${
        highlighted ? 'ring-2 ring-gold-400 shadow-xl shadow-gold-500/40 -translate-y-1.5' : ''
      } ${className}`}
    >
      {/* Top Left Corner */}
      <div className={`flex flex-col items-center leading-none ${textColor}`}>
        <span className={`${sizeStyles.rank} font-black font-serif`}>{card.rank}</span>
        <span className="text-[10px] sm:text-xs">{suitSymbol}</span>
      </div>

      {/* Center Large Suit Symbol */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${textColor} opacity-90`}>
        <span className={`${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'} font-serif`}>
          {suitSymbol}
        </span>
      </div>

      {/* Bottom Right Corner (inverted) */}
      <div className={`flex flex-col items-center leading-none rotate-180 self-end ${textColor}`}>
        <span className={`${sizeStyles.rank} font-black font-serif`}>{card.rank}</span>
        <span className="text-[10px] sm:text-xs">{suitSymbol}</span>
      </div>
    </div>
  );
};
