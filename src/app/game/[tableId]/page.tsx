'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Coins,
  Shield,
  Trophy,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  X,
  Crown,
} from 'lucide-react';
import { PlayingCard } from '@/components/PlayingCard';
import { ChipStack } from '@/components/ChipStack';
import { useToast } from '@/components/Toast';
import { DepositModal } from '@/components/DepositModal';
import {
  Card,
  createDeck,
  shuffleDeck,
  evaluateHand,
  compareHands,
  decideBotAction,
  HandResult,
  Personality,
} from '@/lib/gameEngine';
import { soundManager } from '@/lib/sounds';

interface PlayerState {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  cards: Card[];
  isSeen: boolean;
  isFolded: boolean;
  isBot: boolean;
  personality?: Personality;
  lastAction?: string;
  handResult?: HandResult;
}

// Absolute Table Pot Limit Rule
const MAX_POT_LIMIT = 10000;

export default function GameTablePage() {
  const router = useRouter();
  const params = useParams();
  const tableId = params.tableId as string;
  const { showToast } = useToast();

  const [tableInfo, setTableInfo] = useState<{
    name: string;
    bootAmount: number;
    minBalance: number;
    maxBet: number;
  }>({
    name: 'Mumbai High Stakes',
    bootAmount: 50,
    minBalance: 250,
    maxBet: 1000,
  });

  const [userProfile, setUserProfile] = useState<{
    id: string;
    name: string;
    balance: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  // Game Engine State
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [pot, setPot] = useState<number>(0);
  const [currentBet, setCurrentBet] = useState<number>(50);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [gamePhase, setGamePhase] = useState<'WAITING' | 'PLAYING' | 'SHOWDOWN'>('WAITING');
  const [winner, setWinner] = useState<{
    player: PlayerState;
    handResult: HandResult;
    pot: number;
    comparisonReason?: string;
    opponentHand?: { player: PlayerState; handResult: HandResult };
  } | null>(null);

  const [statusMessage, setStatusMessage] = useState<string>('Welcome to the Table!');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [userCardsSeen, setUserCardsSeen] = useState<boolean>(false);
  const [showdownModalOpen, setShowdownModalOpen] = useState<boolean>(false);

  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load: Auth and Table Data
  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, tablesRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/tables'),
        ]);

        if (meRes.status === 401) {
          router.push('/login');
          return;
        }

        const meData = await meRes.json();
        const tablesData = await tablesRes.json();

        setUserProfile(meData.user);

        const currentTbl = tablesData.tables?.find((t: any) => t.id === tableId) || {
          name: 'Mumbai High Stakes',
          bootAmount: 50,
          minBalance: 250,
          maxBet: 1000,
        };
        setTableInfo(currentTbl);
        setCurrentBet(currentTbl.bootAmount);

        // Check user balance for boot amount
        if (meData.user.balance < currentTbl.bootAmount) {
          showToast(
            'error',
            'Insufficient Balance',
            `You need at least ₹${currentTbl.bootAmount} to pay the table boot. Please deposit funds.`
          );
          setIsDepositOpen(true);
        } else {
          startNewHand(meData.user, currentTbl);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    };
  }, [tableId]);

  // 2. Start a fresh hand
  const startNewHand = (user: { id: string; name: string; balance: number }, table: { bootAmount: number; name: string; maxBet: number }) => {
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);

    if (user.balance < table.bootAmount) {
      showToast('error', 'Insufficient Balance', 'Please deposit funds to play the next hand.');
      setIsDepositOpen(true);
      return;
    }

    soundManager.playCardDeal();
    setUserCardsSeen(false);
    setWinner(null);
    setShowdownModalOpen(false);
    setGamePhase('PLAYING');
    setRoundNumber(1);
    setCurrentBet(table.bootAmount);

    // Shuffle and deal 3 cards to 4 players
    const deck = shuffleDeck(createDeck());
    const p0Cards = deck.slice(0, 3);
    const p1Cards = deck.slice(3, 6);
    const p2Cards = deck.slice(6, 9);
    const p3Cards = deck.slice(9, 12);

    const initialPlayers: PlayerState[] = [
      {
        id: user.id,
        name: `You (${user.name})`,
        avatar: 'user',
        chips: user.balance - table.bootAmount,
        cards: p0Cards,
        isSeen: false,
        isFolded: false,
        isBot: false,
        lastAction: `Boot (₹${table.bootAmount})`,
        handResult: evaluateHand(p0Cards),
      },
      {
        id: 'bot-sharma',
        name: 'Sharma Ji',
        avatar: 'sharma',
        chips: 14200 - table.bootAmount,
        cards: p1Cards,
        isSeen: false,
        isFolded: false,
        isBot: true,
        personality: 'conservative',
        lastAction: `Boot (₹${table.bootAmount})`,
        handResult: evaluateHand(p1Cards),
      },
      {
        id: 'bot-priya',
        name: 'Priya',
        avatar: 'priya',
        chips: 24500 - table.bootAmount,
        cards: p2Cards,
        isSeen: false,
        isFolded: false,
        isBot: true,
        personality: 'balanced',
        lastAction: `Boot (₹${table.bootAmount})`,
        handResult: evaluateHand(p2Cards),
      },
      {
        id: 'bot-bunty',
        name: 'Bunty',
        avatar: 'bunty',
        chips: 8500 - table.bootAmount,
        cards: p3Cards,
        isSeen: false,
        isFolded: false,
        isBot: true,
        personality: 'aggressive',
        lastAction: `Boot (₹${table.bootAmount})`,
        handResult: evaluateHand(p3Cards),
      },
    ];

    setPlayers(initialPlayers);
    const initialPot = table.bootAmount * 4;
    setPot(initialPot);
    setStatusMessage(`Boot collected (₹${table.bootAmount} each). Table Pot: ₹${initialPot}. Hand dealt!`);

    // Deduct user balance in state
    setUserProfile((prev) => (prev ? { ...prev, balance: prev.balance - table.bootAmount } : null));

    // User starts first
    setActivePlayerIndex(0);
  };

  // 3. Bot Turn Engine
  useEffect(() => {
    if (gamePhase !== 'PLAYING') return;

    const activePlayer = players[activePlayerIndex];
    if (!activePlayer || !activePlayer.isBot || activePlayer.isFolded) {
      return;
    }

    const remaining = players.filter((p) => !p.isFolded);
    if (remaining.length <= 1) {
      executeShowdown();
      return;
    }

    // Bot "thinks"
    const thinkDelay = 1000 + Math.random() * 1000;
    turnTimerRef.current = setTimeout(() => {
      executeBotTurn(activePlayer);
    }, thinkDelay);

    return () => {
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    };
  }, [activePlayerIndex, gamePhase, players]);

  const executeBotTurn = (bot: PlayerState) => {
    const remaining = players.filter((p) => !p.isFolded);

    // If Pot is close to ₹10k or 2 players left in late rounds -> Bot requests Showdown
    if (pot >= 8500 || (remaining.length === 2 && roundNumber >= 3)) {
      soundManager.playChipBet();
      setStatusMessage(`${bot.name} called for a SHOWDOWN!`);
      executeShowdown();
      return;
    }

    // Bot decides action
    const decision = decideBotAction({
      hand: bot.cards,
      personality: bot.personality || 'balanced',
      isBlind: !bot.isSeen,
      currentBet,
      pot,
      roundNumber,
      playersRemaining: remaining.length,
    });

    if (decision.action === 'show' && remaining.length === 2) {
      soundManager.playChipBet();
      setStatusMessage(`${bot.name} called for a SHOWDOWN!`);
      executeShowdown();
      return;
    }

    if (decision.action === 'pack') {
      soundManager.playFold();
      updatePlayerAction(bot.id, 'Folded (Pack)', true, false, 0);
      setStatusMessage(`${bot.name} folded.`);
      advanceTurn();
      return;
    }

    // Bot bets Chaal or Blind
    const betCost = bot.isSeen ? currentBet * 2 : currentBet;

    // Check if adding this bet exceeds ₹10,000 Pot Cap
    if (pot + betCost >= MAX_POT_LIMIT) {
      const allowedAdd = Math.max(0, MAX_POT_LIMIT - pot);
      setPot(MAX_POT_LIMIT);
      updatePlayerAction(bot.id, `Pot Capped at ₹10k`, false, bot.isSeen, allowedAdd);
      setStatusMessage(`⚠️ Maximum Pot Cap of ₹10,000 Reached! Forced Showdown Triggered!`);
      showToast('warning', 'Pot Cap Reached', 'Table reached maximum pot of ₹10,000! Executing Showdown.');
      setTimeout(executeShowdown, 800);
      return;
    }

    soundManager.playChipBet();

    if (decision.action === 'raise' && currentBet * 2 <= 1000) {
      const raisedBet = currentBet * 2;
      setCurrentBet(raisedBet);
      setPot((prev) => Math.min(MAX_POT_LIMIT, prev + betCost * 2));
      updatePlayerAction(bot.id, `Raised to ₹${raisedBet}`, false, bot.isSeen, betCost * 2);
      setStatusMessage(`${bot.name} RAISED the bet to ₹${raisedBet}!`);
    } else {
      setPot((prev) => Math.min(MAX_POT_LIMIT, prev + betCost));
      updatePlayerAction(
        bot.id,
        bot.isSeen ? `Chaal (₹${betCost})` : `Blind (₹${betCost})`,
        false,
        bot.isSeen,
        betCost
      );
      setStatusMessage(`${bot.name} played ${bot.isSeen ? 'Chaal' : 'Blind'} (₹${betCost}).`);
    }

    advanceTurn();
  };

  const updatePlayerAction = (
    playerId: string,
    actionText: string,
    folded: boolean,
    seen: boolean,
    amountDeducted: number
  ) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            isFolded: folded ? true : p.isFolded,
            isSeen: seen || p.isSeen,
            chips: Math.max(0, p.chips - amountDeducted),
            lastAction: actionText,
          };
        }
        return p;
      })
    );
  };

  const advanceTurn = () => {
    setPlayers((currentPlayers) => {
      const activeCount = currentPlayers.filter((p) => !p.isFolded).length;
      if (activeCount <= 1) {
        setTimeout(executeShowdown, 500);
        return currentPlayers;
      }

      let nextIndex = (activePlayerIndex + 1) % currentPlayers.length;
      while (currentPlayers[nextIndex].isFolded) {
        nextIndex = (nextIndex + 1) % currentPlayers.length;
      }

      setActivePlayerIndex(nextIndex);
      if (nextIndex === 0) {
        setRoundNumber((r) => r + 1);
      }
      return currentPlayers;
    });
  };

  // 4. Human Player Actions
  const handleUserBet = (isRaise = false) => {
    if (!userProfile) return;

    const user = players[0];
    if (user.isFolded) return;

    const baseBet = user.isSeen ? currentBet * 2 : currentBet;
    const finalAmount = isRaise ? baseBet * 2 : baseBet;

    // Check ₹10,000 POT CAP
    if (pot + finalAmount >= MAX_POT_LIMIT) {
      const actualDeduct = Math.max(0, MAX_POT_LIMIT - pot);
      soundManager.playChipBet();
      setPot(MAX_POT_LIMIT);
      setUserProfile((prev) => (prev ? { ...prev, balance: Math.max(0, prev.balance - actualDeduct) } : null));

      setStatusMessage('⚠️ Table Pot Cap of ₹10,000 Reached! Forced Showdown!');
      showToast('warning', '₹10k Pot Limit Reached', 'The maximum pot of ₹10,000 has been reached. Showdown initiated!');
      setTimeout(executeShowdown, 600);
      return;
    }

    // Strict balance check
    if (userProfile.balance < finalAmount) {
      soundManager.playFold();
      showToast(
        'error',
        'Insufficient Balance',
        `You need ₹${finalAmount} in your wallet to place this bet. Please deposit funds.`
      );
      setIsDepositOpen(true);
      return;
    }

    soundManager.playChipBet();
    const newBetLevel = isRaise ? currentBet * 2 : currentBet;
    if (isRaise) {
      setCurrentBet(newBetLevel);
    }

    setPot((prev) => prev + finalAmount);
    setUserProfile((prev) => (prev ? { ...prev, balance: prev.balance - finalAmount } : null));

    updatePlayerAction(
      user.id,
      isRaise ? `Raised to ₹${newBetLevel}` : user.isSeen ? `Chaal (₹${finalAmount})` : `Blind (₹${finalAmount})`,
      false,
      user.isSeen,
      finalAmount
    );

    setStatusMessage(`You placed ${isRaise ? 'a Raise' : user.isSeen ? 'Chaal' : 'Blind'} of ₹${finalAmount}.`);
    advanceTurn();
  };

  const handleUserFold = () => {
    soundManager.playFold();
    updatePlayerAction(players[0].id, 'Folded', true, players[0].isSeen, 0);
    setStatusMessage('You folded. Waiting for the hand to complete.');
    advanceTurn();
  };

  // Human player views their 3 cards ("See Cards / Show Cart")
  const handleUserSeeCards = () => {
    soundManager.playCardFlip();
    setUserCardsSeen(true);
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === 0 ? { ...p, isSeen: true } : p))
    );
    showToast('info', 'Cards Revealed', `Your Hand: ${players[0]?.handResult?.description}`);
  };

  // Human calls Showdown ("Show Cards / Show Cart")
  const handleShowdownClick = () => {
    soundManager.playChipBet();
    setStatusMessage('You called for a SHOWDOWN!');
    executeShowdown();
  };

  // 5. Final Showdown & Settlement
  const executeShowdown = async () => {
    setGamePhase('SHOWDOWN');

    // Reveal ALL players' cards
    setPlayers((prev) => prev.map((p) => ({ ...p, isSeen: true })));

    const activePlayers = players.filter((p) => !p.isFolded);
    if (activePlayers.length === 0) return;

    let bestPlayer = activePlayers[0];
    let secondBestPlayer: PlayerState | null = null;

    for (let i = 1; i < activePlayers.length; i++) {
      const cmp = compareHands(activePlayers[i].handResult!, bestPlayer.handResult!);
      if (cmp > 0) {
        secondBestPlayer = bestPlayer;
        bestPlayer = activePlayers[i];
      } else {
        if (!secondBestPlayer || compareHands(activePlayers[i].handResult!, secondBestPlayer.handResult!) > 0) {
          secondBestPlayer = activePlayers[i];
        }
      }
    }

    if (!secondBestPlayer && activePlayers.length > 1) {
      secondBestPlayer = activePlayers.find((p) => p.id !== bestPlayer.id) || null;
    }

    const isUserWinner = bestPlayer.id === players[0].id;
    const opponent = isUserWinner ? secondBestPlayer : (activePlayers.find((p) => p.id === players[0].id) || secondBestPlayer);

    setWinner({
      player: bestPlayer,
      handResult: bestPlayer.handResult!,
      pot: Math.min(pot, MAX_POT_LIMIT),
      comparisonReason: `${bestPlayer.handResult?.description} beats ${opponent?.handResult?.description || 'other hands'}`,
      opponentHand: opponent ? { player: opponent, handResult: opponent.handResult! } : undefined,
    });

    setShowdownModalOpen(true);

    if (isUserWinner) {
      soundManager.playWin();
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#10b981', '#f59e0b', '#ffffff'],
      });
      showToast('success', '🏆 VICTORY!', `You won the pot of ₹${pot.toLocaleString('en-IN')}`);
    } else {
      soundManager.playFold();
      showToast('info', 'Showdown Result', `${bestPlayer.name} won with ${bestPlayer.handResult?.description}`);
    }

    // Save match outcome to database
    try {
      await fetch('/api/user/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: tableInfo.name,
          bootAmount: tableInfo.bootAmount,
          totalPot: Math.min(pot, MAX_POT_LIMIT),
          result: isUserWinner ? 'WIN' : players[0].isFolded ? 'FOLD' : 'LOSS',
          amountChange: isUserWinner ? Math.min(pot, MAX_POT_LIMIT) : 0,
          cards: players[0].cards,
          handRank: players[0].handResult?.rank || 'high_card',
          opponents: 'Sharma Ji, Priya, Bunty',
        }),
      });

      // Refetch live user balance
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setUserProfile(meData.user);
      }
    } catch (err) {
      console.error('Match settlement error:', err);
    }
  };

  const activeCount = players.filter((p) => !p.isFolded).length;
  const isUserTurn = activePlayerIndex === 0 && !players[0]?.isFolded && gamePhase === 'PLAYING';
  const userChaalAmount = players[0]?.isSeen ? currentBet * 2 : currentBet;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b10] flex items-center justify-center text-gold-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold uppercase tracking-wider">Loading Teen Patti Arena...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080c] flex flex-col justify-between select-none relative overflow-hidden">
      {/* Top Navbar */}
      <header className="z-30 bg-slate-950/90 backdrop-blur-md border-b border-gold-500/20 px-3 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Lobby
          </button>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5 font-serif">
              {tableInfo.name}
              <span className="text-[10px] text-gold-400 font-sans font-semibold bg-gold-500/10 border border-gold-500/30 px-2 py-0.5 rounded-full">
                Boot ₹{tableInfo.bootAmount}
              </span>
            </h1>
          </div>
        </div>

        {/* Live Balance & Pot Cap Reminder */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 text-[11px] text-amber-400/90 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono">
            <span>Pot Cap: ₹10,000</span>
          </div>

          <button
            onClick={() => {
              const state = soundManager.toggleSound();
              setSoundOn(state);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-gold-400 transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-gold-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div
            onClick={() => setIsDepositOpen(true)}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-gold-500/40 hover:border-gold-400 transition-all shadow-md"
          >
            <Coins className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">Wallet</span>
              <span className="text-xs font-mono font-bold text-gold-300">
                ₹{userProfile?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Oval Poker Table Area */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 relative">
        <div className="w-full max-w-4xl h-[460px] sm:h-[520px] md:h-[560px] table-rail felt-radial relative flex items-center justify-center p-2 sm:p-4">
          {/* Subtle felt watermark */}
          <div className="absolute inset-8 sm:inset-12 border border-gold-400/20 rounded-full pointer-events-none opacity-30"></div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <span className="text-8xl sm:text-9xl font-serif text-gold-400 font-black">♠</span>
          </div>

          {/* Center Table Pot & Actions Ticker */}
          <div className="flex flex-col items-center justify-center z-20 text-center">
            <div className="px-4 py-2 rounded-2xl bg-black/70 border border-gold-500/40 backdrop-blur-md shadow-2xl flex flex-col items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-400" /> Current Pot
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-gold-300 flex items-center gap-1 drop-shadow">
                ₹{pot.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-amber-300/80 font-mono">
                {pot >= MAX_POT_LIMIT ? 'POT CAP REACHED (₹10k)' : `Max Cap: ₹10,000`}
              </span>
            </div>

            <ChipStack amount={pot} size="lg" showLabel={false} />

            {/* Live Status Ticker */}
            <div className="mt-2 px-3 py-1 rounded-full bg-black/80 border border-slate-700/80 text-[11px] text-slate-200 max-w-xs truncate shadow">
              {statusMessage}
            </div>
          </div>

          {/* Seat 1: Top Player (Sharma Ji - Conservative Bot) */}
          <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
            <div
              className={`p-2 rounded-2xl flex flex-col items-center transition-all ${
                activePlayerIndex === 1 && gamePhase === 'PLAYING'
                  ? 'ring-2 ring-gold-400 shadow-xl shadow-gold-500/30 scale-105 bg-slate-900/95'
                  : 'bg-black/60'
              } border border-slate-800 min-w-[110px] sm:min-w-[130px]`}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-900 border border-purple-400 flex items-center justify-center text-xs font-bold text-white">
                  SJ
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight">Sharma Ji</div>
                  <div className="text-[10px] text-gold-300 font-mono">₹{players[1]?.chips.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {players[1]?.lastAction && (
                <span className="text-[9px] mt-1 text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                  {players[1].lastAction}
                </span>
              )}

              {/* Sharma Ji Cards */}
              <div className="flex gap-1 mt-1.5">
                {players[1]?.cards.map((c, i) => (
                  <PlayingCard
                    key={i}
                    card={c}
                    faceDown={gamePhase !== 'SHOWDOWN' && !players[1]?.isSeen}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Seat 2: Right Player (Priya - Balanced Bot) */}
          <div className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div
              className={`p-2 rounded-2xl flex flex-col items-center transition-all ${
                activePlayerIndex === 2 && gamePhase === 'PLAYING'
                  ? 'ring-2 ring-gold-400 shadow-xl shadow-gold-500/30 scale-105 bg-slate-900/95'
                  : 'bg-black/60'
              } border border-slate-800 min-w-[100px] sm:min-w-[120px]`}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-900 border border-emerald-400 flex items-center justify-center text-xs font-bold text-white">
                  PR
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight">Priya</div>
                  <div className="text-[10px] text-gold-300 font-mono">₹{players[2]?.chips.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {players[2]?.lastAction && (
                <span className="text-[9px] mt-1 text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                  {players[2].lastAction}
                </span>
              )}

              {/* Priya Cards */}
              <div className="flex gap-1 mt-1.5">
                {players[2]?.cards.map((c, i) => (
                  <PlayingCard
                    key={i}
                    card={c}
                    faceDown={gamePhase !== 'SHOWDOWN' && !players[2]?.isSeen}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Seat 3: Left Player (Bunty - Aggressive Bot) */}
          <div className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div
              className={`p-2 rounded-2xl flex flex-col items-center transition-all ${
                activePlayerIndex === 3 && gamePhase === 'PLAYING'
                  ? 'ring-2 ring-gold-400 shadow-xl shadow-gold-500/30 scale-105 bg-slate-900/95'
                  : 'bg-black/60'
              } border border-slate-800 min-w-[100px] sm:min-w-[120px]`}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-900 border border-rose-400 flex items-center justify-center text-xs font-bold text-white">
                  BU
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight">Bunty</div>
                  <div className="text-[10px] text-gold-300 font-mono">₹{players[3]?.chips.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {players[3]?.lastAction && (
                <span className="text-[9px] mt-1 text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                  {players[3].lastAction}
                </span>
              )}

              {/* Bunty Cards */}
              <div className="flex gap-1 mt-1.5">
                {players[3]?.cards.map((c, i) => (
                  <PlayingCard
                    key={i}
                    card={c}
                    faceDown={gamePhase !== 'SHOWDOWN' && !players[3]?.isSeen}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Seat 0: Bottom Player (User / You) */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
            {/* Hand evaluation badge */}
            {userCardsSeen && players[0]?.handResult && (
              <div className="mb-1 px-3 py-0.5 rounded-full bg-gold-500/20 border border-gold-400/50 text-gold-300 font-serif font-bold text-xs shadow-lg animate-pulse">
                ✨ {players[0].handResult.description}
              </div>
            )}

            {/* User Cards Fan */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5">
              {players[0]?.cards.map((c, i) => (
                <PlayingCard
                  key={i}
                  card={c}
                  faceDown={!userCardsSeen && gamePhase !== 'SHOWDOWN'}
                  size="md"
                  highlighted={userCardsSeen}
                />
              ))}
            </div>

            {/* Toggle See Cards Button (Show Cart) */}
            {!userCardsSeen && gamePhase === 'PLAYING' && !players[0]?.isFolded && (
              <button
                onClick={handleUserSeeCards}
                className="py-1 px-3.5 mb-1.5 rounded-full bg-gradient-to-r from-amber-600 to-gold-500 border border-gold-300 text-slate-950 text-xs font-black uppercase flex items-center gap-1.5 shadow-lg shadow-gold-500/20 hover:scale-105 transition-all"
              >
                <Eye className="w-3.5 h-3.5" /> See Cards (Chaal 2x)
              </button>
            )}

            {/* Player Info Badge */}
            <div
              className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2.5 backdrop-blur-md ${
                isUserTurn
                  ? 'border-gold-400 bg-slate-900/95 ring-2 ring-gold-400/80 shadow-xl shadow-gold-500/20'
                  : 'border-slate-800 bg-slate-950/80'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gold-500 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-xs">
                YOU
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  {userProfile?.name}
                  {userCardsSeen ? (
                    <span className="text-[9px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded">Seen</span>
                  ) : (
                    <span className="text-[9px] text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded">Blind</span>
                  )}
                </div>
                <div className="text-xs font-mono font-bold text-gold-400">
                  ₹{userProfile?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              {isUserTurn && (
                <span className="text-[10px] font-black uppercase text-amber-400 animate-pulse">Your Turn!</span>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Betting Controls Console */}
      <footer className="z-30 bg-slate-950/95 border-t border-gold-500/20 px-4 py-3 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Turn Status Message */}
          <div className="flex items-center gap-2 text-xs">
            {isUserTurn ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-950/50 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                <Clock className="w-4 h-4 animate-spin" /> Your turn to bet
              </span>
            ) : gamePhase === 'SHOWDOWN' ? (
              <span className="text-emerald-400 font-bold">Hand Complete</span>
            ) : (
              <span className="text-slate-400">Waiting for opponents...</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {gamePhase === 'PLAYING' && !players[0]?.isFolded ? (
              <>
                {/* Pack / Fold */}
                <button
                  onClick={handleUserFold}
                  disabled={!isUserTurn}
                  className="py-2.5 px-3.5 sm:px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-400 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                >
                  Pack / Fold
                </button>

                {/* Blind / Chaal Button */}
                <button
                  onClick={() => handleUserBet(false)}
                  disabled={!isUserTurn}
                  className="py-2.5 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  {userCardsSeen ? `Chaal (₹${userChaalAmount})` : `Blind (₹${userChaalAmount})`}
                </button>

                {/* Raise (2x) Button */}
                <button
                  onClick={() => handleUserBet(true)}
                  disabled={!isUserTurn || pot + userChaalAmount * 2 > MAX_POT_LIMIT}
                  className="py-2.5 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-gold-500/20 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  Raise (₹{userChaalAmount * 2})
                </button>

                {/* Show Button: active whenever 2 players remain or called */}
                {activeCount <= 2 && (
                  <button
                    onClick={handleShowdownClick}
                    disabled={!isUserTurn}
                    className="py-2.5 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center gap-1.5 animate-pulse"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    SHOW (₹{userChaalAmount})
                  </button>
                )}
              </>
            ) : (
              /* Rematch / Deal Next Hand */
              <button
                onClick={() => userProfile && startNewHand(userProfile, tableInfo)}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-gold-500 via-amber-500 to-yellow-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-gold-500/20 flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4" /> Deal Next Hand (Boot ₹{tableInfo.bootAmount})
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* SHOWDOWN ARENA MODAL (Full Card Reveal & Side-by-Side Comparison) */}
      {showdownModalOpen && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-gold-500/50 rounded-3xl max-w-xl w-full p-6 text-center shadow-2xl relative text-white">
            <button
              onClick={() => setShowdownModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-400 to-amber-600 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-gold-500/30 border border-gold-300">
              <Trophy className="w-8 h-8 text-slate-950" />
            </div>

            <h2 className="text-2xl font-black text-white font-serif mb-1">
              {winner.player.id === players[0]?.id ? '🎉 VICTORY! YOU WON!' : `${winner.player.name} WINS THE POT!`}
            </h2>

            <div className="text-xs text-gold-300 font-semibold mb-4">
              {winner.comparisonReason || winner.handResult.description}
            </div>

            {/* SIDE-BY-SIDE HAND COMPARISON */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Winner's Hand Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-gold-400 shadow-xl relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                  <Crown className="w-3 h-3" /> Winner Hand
                </div>
                <div className="text-sm font-bold text-white mt-1 mb-2">
                  {winner.player.name}
                </div>
                <div className="flex justify-center gap-1.5 mb-2">
                  {winner.player.cards.map((c, i) => (
                    <PlayingCard key={i} card={c} size="sm" highlighted={true} />
                  ))}
                </div>
                <div className="text-xs font-serif font-black text-gold-400">
                  {winner.handResult.description}
                </div>
              </div>

              {/* Runner-Up / Opponent Hand Box */}
              {winner.opponentHand && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 opacity-90">
                  <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">
                    Runner Up Hand
                  </div>
                  <div className="text-sm font-bold text-slate-300 mb-2">
                    {winner.opponentHand.player.name}
                  </div>
                  <div className="flex justify-center gap-1.5 mb-2">
                    {winner.opponentHand.player.cards.map((c, i) => (
                      <PlayingCard key={i} card={c} size="sm" />
                    ))}
                  </div>
                  <div className="text-xs font-serif font-semibold text-slate-400">
                    {winner.opponentHand.handResult.description}
                  </div>
                </div>
              )}
            </div>

            {/* Total Pot Won */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-gold-500/30 mb-6 flex justify-between items-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Pot Claimed:</span>
              <span className="text-2xl font-mono font-black text-gold-300">
                ₹{winner.pot.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase transition-colors"
              >
                Back to Lobby
              </button>
              <button
                onClick={() => {
                  setShowdownModalOpen(false);
                  if (userProfile) startNewHand(userProfile, tableInfo);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-gold-500/20"
              >
                Deal Next Hand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={(newBal) => {
          setUserProfile((prev) => (prev ? { ...prev, balance: newBal } : null));
          if (players.length > 0) {
            setPlayers((prev) => prev.map((p, idx) => (idx === 0 ? { ...p, chips: newBal } : p)));
          }
        }}
        currentBalance={userProfile?.balance || 0}
      />
    </div>
  );
}
