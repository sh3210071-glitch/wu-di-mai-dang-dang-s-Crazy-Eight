
import { Suit, Rank, CardData } from './types';

export const createDeck = (): CardData[] => {
  const deck: CardData[] = [];
  const suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
  const ranks = [
    Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE,
    Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN,
    Rank.JACK, Rank.QUEEN, Rank.KING
  ];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
      });
    }
  }
  return shuffle(deck);
};

export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const isValidMove = (card: CardData, topCard: CardData, currentSuit: Suit | null): boolean => {
  // 8 is always valid
  if (card.rank === Rank.EIGHT) return true;

  const targetSuit = currentSuit || topCard.suit;
  
  // Match suit or rank
  return card.suit === targetSuit || card.rank === topCard.rank;
};
