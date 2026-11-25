export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // 2 to 14 (Ace = 14)
}

export type HandRank = 'trail' | 'pure_sequence' | 'sequence' | 'color' | 'pair' | 'high_card';

export interface HandResult {
  rank: HandRank;
  cards: Card[];
  highCard: number;
  description: string;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function getCardValue(rank: Rank): number {
  const map: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return map[rank];
}

export function createCard(suit: Suit, rank: Rank): Card {
  return {
    suit,
    rank,
    value: getCardValue(rank),
  };
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank));
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => b.value - a.value);
}

export function evaluateHand(cards: Card[]): HandResult {
  if (!cards || cards.length !== 3) {
    return {
      rank: 'high_card',
      cards: cards || [],
      highCard: 0,
      description: 'Invalid Hand',
    };
  }

  const sorted = sortCards(cards);
  const [c1, c2, c3] = sorted;

  // 1. Trail (Three of a kind)
  if (c1.value === c2.value && c2.value === c3.value) {
    return {
      rank: 'trail',
      cards: sorted,
      highCard: c1.value,
      description: `Trail of ${c1.rank}s`,
    };
  }

  // Same suit check
  const sameSuit = c1.suit === c2.suit && c2.suit === c3.suit;

  // Check sequence: standard (K-Q-J, etc.) or A-2-3
  const isNormalSeq = c1.value - c2.value === 1 && c2.value - c3.value === 1;
  const isA23Seq = c1.value === 14 && c2.value === 3 && c3.value === 2;
  const isSeq = isNormalSeq || isA23Seq;

  // 2. Pure Sequence (Straight Flush)
  if (sameSuit && isSeq) {
    const high = isA23Seq ? 3 : c1.value;
    return {
      rank: 'pure_sequence',
      cards: sorted,
      highCard: high,
      description: `Pure Sequence (${sorted.map((c) => c.rank).join('-')})`,
    };
  }

  // 3. Sequence (Straight)
  if (isSeq) {
    const high = isA23Seq ? 3 : c1.value;
    return {
      rank: 'sequence',
      cards: sorted,
      highCard: high,
      description: `Sequence (${sorted.map((c) => c.rank).join('-')})`,
    };
  }

  // 4. Color (Flush)
  if (sameSuit) {
    return {
      rank: 'color',
      cards: sorted,
      highCard: c1.value,
      description: `Flush of ${c1.suit}`,
    };
  }

  // 5. Pair
  if (c1.value === c2.value || c2.value === c3.value || c1.value === c3.value) {
    const pairVal = c1.value === c2.value ? c1.value : (c2.value === c3.value ? c2.value : c1.value);
    const kicker = c1.value === pairVal && c2.value === pairVal ? c3.value : (c1.value === pairVal ? c2.value : c1.value);
    const rankName = sorted.find((c) => c.value === pairVal)?.rank;
    return {
      rank: 'pair',
      cards: sorted,
      highCard: pairVal,
      description: `Pair of ${rankName}s (kicker ${sorted.find((c) => c.value === kicker)?.rank})`,
    };
  }

  // 6. High Card
  return {
    rank: 'high_card',
    cards: sorted,
    highCard: c1.value,
    description: `High Card ${c1.rank}`,
  };
}

const RANK_STRENGTH: Record<HandRank, number> = {
  high_card: 1,
  pair: 2,
  color: 3,
  sequence: 4,
  pure_sequence: 5,
  trail: 6,
};

export function compareHands(hand1: HandResult, hand2: HandResult): number {
  if (RANK_STRENGTH[hand1.rank] !== RANK_STRENGTH[hand2.rank]) {
    return RANK_STRENGTH[hand1.rank] - RANK_STRENGTH[hand2.rank];
  }

  // Same rank - compare high card
  if (hand1.highCard !== hand2.highCard) {
    return hand1.highCard - hand2.highCard;
  }

  // Same high card - compare remaining cards
  for (let i = 0; i < 3; i++) {
    if (hand1.cards[i].value !== hand2.cards[i].value) {
      return hand1.cards[i].value - hand2.cards[i].value;
    }
  }

  return 0; // tie
}

export function calculateHandStrength(cards: Card[]): number {
  const result = evaluateHand(cards);
  const baseScores: Record<HandRank, number> = {
    high_card: 0.15,
    pair: 0.45,
    color: 0.70,
    sequence: 0.82,
    pure_sequence: 0.94,
    trail: 0.99,
  };
  const base = baseScores[result.rank];
  const cardBonus = (result.highCard - 2) / 12 * 0.08;
  return Math.min(0.99, base + cardBonus);
}

export type Personality = 'conservative' | 'balanced' | 'aggressive';

export interface BotActionContext {
  hand: Card[];
  personality: Personality;
  isBlind: boolean;
  currentBet: number;
  pot: number;
  roundNumber: number;
  playersRemaining: number;
}

export function decideBotAction(ctx: BotActionContext): {
  action: 'blind' | 'chaal' | 'raise' | 'pack' | 'show';
  raiseAmount?: number;
} {
  const strength = calculateHandStrength(ctx.hand);
  const rand = Math.random();

  // If 2 players left, consider show
  if (ctx.playersRemaining === 2 && !ctx.isBlind && ctx.roundNumber >= 3) {
    if (strength > 0.45 || rand < 0.6) {
      return { action: 'show' };
    }
  }

  // If hand is very weak and not blind
  if (!ctx.isBlind && strength < 0.3) {
    // Aggressive bots might bluff 20% of time
    if (ctx.personality === 'aggressive' && rand < 0.25) {
      return { action: 'raise', raiseAmount: ctx.currentBet * 2 };
    }
    // Otherwise pack
    if (rand < 0.75) {
      return { action: 'pack' };
    }
  }

  // If blind, bots usually play blind for a couple rounds
  if (ctx.isBlind) {
    if (ctx.roundNumber <= 2 || rand < 0.7) {
      return { action: 'blind' };
    }
  }

  // Strong hand: raise or chaal
  if (strength > 0.65) {
    if (rand < 0.45) {
      return { action: 'raise', raiseAmount: ctx.currentBet * 2 };
    }
    return { action: 'chaal' };
  }

  return { action: 'chaal' };
}
