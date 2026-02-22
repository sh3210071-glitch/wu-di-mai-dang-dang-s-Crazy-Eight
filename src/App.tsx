/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  User, 
  Cpu, 
  Info, 
  ChevronRight,
  Heart,
  Diamond,
  Club,
  Spade,
  Hand as HandIcon,
  Zap
} from 'lucide-react';
import { Suit, Rank, CardData, GameStatus, GameState } from './types';
import { createDeck, isValidMove, shuffle } from './gameLogic';

// --- Components ---

const SuitIcon = ({ suit, className = "" }: { suit: Suit; className?: string }) => {
  switch (suit) {
    case Suit.HEARTS: return <Heart className={`fill-rose-500 text-rose-500 ${className}`} />;
    case Suit.DIAMONDS: return <Diamond className={`fill-rose-500 text-rose-500 ${className}`} />;
    case Suit.CLUBS: return <Club className={`fill-zinc-400 text-zinc-400 ${className}`} />;
    case Suit.SPADES: return <Spade className={`fill-zinc-400 text-zinc-400 ${className}`} />;
  }
};

interface CardProps {
  key?: React.Key;
  card: CardData;
  isFaceDown?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
}

const Card = ({ 
  card, 
  isFaceDown = false, 
  onClick, 
  isPlayable = false,
  className = "" 
}: CardProps) => {
  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={isPlayable ? { y: -15, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 
        ${isFaceDown 
          ? 'bg-zinc-800 border-zinc-700' 
          : 'bg-white border-zinc-200'} 
        ${isPlayable ? 'cursor-pointer ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950' : ''}
        flex flex-col items-center justify-center select-none card-shadow
        ${className}
      `}
    >
      {isFaceDown ? (
        <div className="w-full h-full flex items-center justify-center p-2">
          <div className="w-full h-full rounded-lg border-2 border-zinc-700/50 bg-zinc-900 flex items-center justify-center">
            <Zap className="w-8 h-8 text-zinc-700" />
          </div>
        </div>
      ) : (
        <>
          <div className={`absolute top-2 left-2 flex flex-col items-center ${isRed ? 'text-rose-600' : 'text-zinc-900'}`}>
            <span className="text-sm sm:text-lg font-bold leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <div className="flex items-center justify-center">
            <SuitIcon suit={card.suit} className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>
          <div className={`absolute bottom-2 right-2 flex flex-col items-center rotate-180 ${isRed ? 'text-rose-600' : 'text-zinc-900'}`}>
            <span className="text-sm sm:text-lg font-bold leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        </>
      )}
    </motion.div>
  );
};

export default function App() {
  const [state, setState] = useState<GameState>({
    deck: [],
    discardPile: [],
    playerHand: [],
    aiHand: [],
    currentSuit: null,
    currentTurn: 'player',
    status: 'waiting',
    winner: null,
    lastAction: '欢迎来到疯狂 8 点！',
  });

  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- Game Actions ---

  const initGame = useCallback(() => {
    const fullDeck = createDeck();
    const pHand = fullDeck.splice(0, 8);
    const aHand = fullDeck.splice(0, 8);
    const firstDiscard = fullDeck.pop()!;

    setState({
      deck: fullDeck,
      discardPile: [firstDiscard],
      playerHand: pHand,
      aiHand: aHand,
      currentSuit: null,
      currentTurn: 'player',
      status: 'playing',
      winner: null,
      lastAction: '游戏开始！你的回合。',
    });
  }, []);

  const drawCard = useCallback((turn: 'player' | 'ai') => {
    setState(prev => {
      if (prev.deck.length === 0) {
        // If deck is empty, we might need to reshuffle discard pile (except top card)
        if (prev.discardPile.length <= 1) {
          return { ...prev, lastAction: '摸牌堆已空，无法摸牌！', currentTurn: turn === 'player' ? 'ai' : 'player' };
        }
        const topCard = prev.discardPile[prev.discardPile.length - 1];
        const newDeck = shuffle(prev.discardPile.slice(0, -1));
        const card = newDeck.pop()!;
        
        return {
          ...prev,
          deck: newDeck,
          discardPile: [topCard],
          [turn === 'player' ? 'playerHand' : 'aiHand']: [...prev[turn === 'player' ? 'playerHand' : 'aiHand'], card],
          lastAction: `${turn === 'player' ? '你' : 'AI'} 摸了一张牌。`,
          currentTurn: turn === 'player' ? 'ai' : 'player'
        };
      }

      const newDeck = [...prev.deck];
      const card = newDeck.pop()!;
      const newHand = [...prev[turn === 'player' ? 'playerHand' : 'aiHand'], card];

      return {
        ...prev,
        deck: newDeck,
        [turn === 'player' ? 'playerHand' : 'aiHand']: newHand,
        lastAction: `${turn === 'player' ? '你' : 'AI'} 摸了一张牌。`,
        currentTurn: turn === 'player' ? 'ai' : 'player'
      };
    });
  }, []);

  const playCard = useCallback((card: CardData, turn: 'player' | 'ai') => {
    setState(prev => {
      const newHand = prev[turn === 'player' ? 'playerHand' : 'aiHand'].filter(c => c.id !== card.id);
      const isEight = card.rank === Rank.EIGHT;

      const nextStatus: GameStatus = isEight && turn === 'player' ? 'choosing_suit' : 'playing';
      
      // If AI plays 8, it chooses a suit immediately
      let chosenSuit: Suit | null = null;
      if (isEight && turn === 'ai') {
        // AI chooses the suit it has the most of
        const counts = {
          [Suit.HEARTS]: 0,
          [Suit.DIAMONDS]: 0,
          [Suit.CLUBS]: 0,
          [Suit.SPADES]: 0,
        };
        newHand.forEach(c => counts[c.suit]++);
        chosenSuit = (Object.keys(counts) as Suit[]).reduce((a, b) => counts[a] > counts[b] ? a : b);
      }

      const winner = newHand.length === 0 ? turn : null;

      return {
        ...prev,
        discardPile: [...prev.discardPile, card],
        [turn === 'player' ? 'playerHand' : 'aiHand']: newHand,
        currentSuit: chosenSuit,
        currentTurn: isEight && turn === 'player' ? 'player' : (turn === 'player' ? 'ai' : 'player'),
        status: winner ? 'game_over' : nextStatus,
        winner,
        lastAction: `${turn === 'player' ? '你' : 'AI'} 打出了 ${card.rank}${card.suit}。${isEight && turn === 'ai' ? `AI 指定花色为 ${chosenSuit}。` : ''}`,
      };
    });
  }, []);

  const selectSuit = (suit: Suit) => {
    setState(prev => ({
      ...prev,
      currentSuit: suit,
      status: 'playing',
      currentTurn: 'ai',
      lastAction: `你指定花色为 ${suit}。`,
    }));
  };

  // --- AI Logic ---

  useEffect(() => {
    if (state.status === 'playing' && state.currentTurn === 'ai' && !state.winner) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const topCard = state.discardPile[state.discardPile.length - 1];
        const playableCards = state.aiHand.filter(c => isValidMove(c, topCard, state.currentSuit));

        if (playableCards.length > 0) {
          // AI Strategy: Play non-8s first, then 8 if needed
          const nonEights = playableCards.filter(c => c.rank !== Rank.EIGHT);
          const cardToPlay = nonEights.length > 0 
            ? nonEights[Math.floor(Math.random() * nonEights.length)]
            : playableCards[0];
          
          playCard(cardToPlay, 'ai');
        } else {
          drawCard('ai');
        }
        setIsAiThinking(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state.status, state.currentTurn, state.aiHand, state.discardPile, state.currentSuit, state.winner, playCard, drawCard]);

  // --- Helpers ---

  const topCard = state.discardPile[state.discardPile.length - 1];
  const canPlayerMove = useMemo(() => {
    if (state.currentTurn !== 'player' || state.status !== 'playing') return false;
    return state.playerHand.some(c => isValidMove(c, topCard, state.currentSuit));
  }, [state.playerHand, topCard, state.currentSuit, state.currentTurn, state.status]);

  // --- Render ---

  if (state.status === 'waiting') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-md"
        >
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full" />
            <h1 className="relative text-5xl sm:text-6xl font-black tracking-tighter text-white uppercase italic">
              无敌麦当当的<br />
              <span className="text-emerald-500">疯狂 8 点</span>
            </h1>
          </div>
          
          <p className="text-zinc-400 text-lg">
            经典的 Crazy Eights 纸牌游戏。打出所有手牌，利用万能的“8”来改变战局！
          </p>

          <div className="space-y-4">
            <button
              onClick={initGame}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xl rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              开始游戏 <ChevronRight className="w-6 h-6" />
            </button>
            <div className="flex justify-center gap-6 text-zinc-500 text-sm font-medium uppercase tracking-widest">
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> 1 玩家</span>
              <span className="flex items-center gap-1"><Cpu className="w-4 h-4" /> 高级 AI</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col overflow-hidden relative">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-zinc-950 text-xl italic">8</div>
          <div>
            <h2 className="font-bold text-white leading-none">疯狂 8 点</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Crazy Eights</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${state.currentTurn === 'player' ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
            <User className="w-3 h-3" /> 你的回合
          </div>
          <button 
            onClick={() => setState(s => ({ ...s, status: 'waiting' }))}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col p-4 sm:p-8">
        
        {/* AI Hand */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Cpu className={`w-4 h-4 ${isAiThinking ? 'animate-pulse text-emerald-500' : ''}`} />
            <span className="text-xs font-bold uppercase tracking-widest">AI 麦当当 ({state.aiHand.length})</span>
          </div>
          <div className="flex -space-x-12 sm:-space-x-16 hover:-space-x-8 transition-all duration-300">
            {state.aiHand.map((card, i) => (
              <Card key={card.id} card={card} isFaceDown className="scale-90 opacity-80" />
            ))}
          </div>
        </div>

        {/* Center: Draw & Discard */}
        <div className="flex-1 flex items-center justify-center gap-8 sm:gap-16">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <button 
                onClick={() => state.currentTurn === 'player' && !canPlayerMove && drawCard('player')}
                disabled={state.currentTurn !== 'player' || canPlayerMove || state.status !== 'playing'}
                className={`relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center transition-all ${state.currentTurn === 'player' && !canPlayerMove ? 'cursor-pointer hover:scale-105 ring-2 ring-emerald-500 ring-offset-4 ring-offset-zinc-950' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="text-center">
                  <HandIcon className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">摸牌</span>
                </div>
                {state.deck.length > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold border border-zinc-700">
                    {state.deck.length}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <AnimatePresence mode="popLayout">
                <Card 
                  key={topCard.id} 
                  card={topCard} 
                  className="z-10 shadow-2xl shadow-black/50" 
                />
              </AnimatePresence>
              {state.currentSuit && (
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-emerald-500 z-20"
                >
                  <SuitIcon suit={state.currentSuit} className="w-6 h-6" />
                </motion.div>
              )}
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">弃牌堆</span>
          </div>
        </div>

        {/* Player Hand */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <User className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">你的手牌 ({state.playerHand.length})</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-4xl">
            {state.playerHand.map((card) => {
              const playable = state.currentTurn === 'player' && state.status === 'playing' && isValidMove(card, topCard, state.currentSuit);
              return (
                <Card 
                  key={card.id} 
                  card={card} 
                  isPlayable={playable}
                  onClick={() => playCard(card, 'player')}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="p-4 bg-zinc-900/50 border-t border-zinc-800/50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm">
          <Info className="w-4 h-4 text-emerald-500" />
          <span className="text-zinc-300 font-medium">{state.lastAction}</span>
        </div>
      </footer>

      {/* Suit Selection Modal */}
      <AnimatePresence>
        {state.status === 'choosing_suit' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <h3 className="text-2xl font-black text-white uppercase italic">选择花色</h3>
              <p className="text-zinc-400 text-sm">你打出了 8！请指定接下来的花色：</p>
              <div className="grid grid-cols-2 gap-4">
                {[Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES].map(suit => (
                  <button
                    key={suit}
                    onClick={() => selectSuit(suit)}
                    className="p-6 bg-zinc-800 hover:bg-zinc-700 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 border border-zinc-700"
                  >
                    <SuitIcon suit={suit} className="w-10 h-10" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {state.status === 'game_over' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border-2 border-emerald-500/50 p-12 rounded-[40px] max-w-md w-full text-center space-y-8 shadow-2xl shadow-emerald-500/10"
            >
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <Trophy className={`w-12 h-12 ${state.winner === 'player' ? 'text-emerald-500' : 'text-zinc-500'}`} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white uppercase italic">
                  {state.winner === 'player' ? '你赢了！' : 'AI 赢了'}
                </h2>
                <p className="text-zinc-400 font-medium">
                  {state.winner === 'player' ? '太棒了！你清空了所有手牌。' : '再接再厉，AI 麦当当这次更胜一筹。'}
                </p>
              </div>

              <button
                onClick={initGame}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xl rounded-2xl transition-all transform hover:scale-105 active:scale-95"
              >
                再来一局
              </button>
              
              <button
                onClick={() => setState(s => ({ ...s, status: 'waiting' }))}
                className="text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-widest text-xs transition-colors"
              >
                返回主菜单
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
