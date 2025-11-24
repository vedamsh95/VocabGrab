import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Timer, Trophy, RefreshCw } from 'lucide-react';
import { useProgressStore } from '../../store/useProgressStore';
import type { VocabItem } from '../../types/schema';

interface SpeedMatchGameProps {
    vocabulary: VocabItem[];
}

interface Card {
    id: string;
    text: string;
    type: 'word' | 'def';
    matchId: string;
    isFlipped: boolean;
    isMatched: boolean;
}

const SpeedMatchGame: React.FC<SpeedMatchGameProps> = ({ vocabulary }) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<Card[]>([]);
    const [, setMatches] = useState(0); // matches unused
    const [timeLeft, setTimeLeft] = useState(60);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
    const [score, setScore] = useState(0);

    const addXP = useProgressStore(state => state.addXP);

    const initializeGame = () => {
        // Pick 6 random words
        const selected = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 6);

        const newCards: Card[] = [];
        selected.forEach((item) => {
            // Word Card
            newCards.push({
                id: `word-${item.word}`,
                text: item.word,
                type: 'word',
                matchId: item.word,
                isFlipped: false,
                isMatched: false
            });
            // Definition Card
            newCards.push({
                id: `def-${item.word}`,
                text: item.translation,
                type: 'def',
                matchId: item.word,
                isFlipped: false,
                isMatched: false
            });
        });

        // Shuffle cards
        setCards(newCards.sort(() => 0.5 - Math.random()));
        setMatches(0);
        setScore(0);
        setTimeLeft(60);
        setGameState('playing');
        setFlippedCards([]);
    };

    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && gameState === 'playing') {
            setGameState('lost');
        }
    }, [gameState, timeLeft]);

    const handleCardClick = (card: Card) => {
        if (gameState !== 'playing' || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

        const newFlipped = [...flippedCards, card];
        setFlippedCards(newFlipped);

        setCards(prev => prev.map(c => c.id === card.id ? { ...c, isFlipped: true } : c));

        if (newFlipped.length === 2) {
            const [first, second] = newFlipped;
            if (first.matchId === second.matchId) {
                // Match!
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === first.id || c.id === second.id
                            ? { ...c, isMatched: true, isFlipped: true }
                            : c
                    ));
                    setFlippedCards([]);
                    setMatches(prev => {
                        const newMatches = prev + 1;
                        if (newMatches === 6) {
                            setGameState('won');
                            const bonus = timeLeft * 2;
                            const totalScore = 60 + bonus;
                            setScore(totalScore);
                            addXP(totalScore);
                        }
                        return newMatches;
                    });
                    setScore(prev => prev + 10);
                }, 500);
            } else {
                // No Match
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === first.id || c.id === second.id
                            ? { ...c, isFlipped: false }
                            : c
                    ));
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    return (
        <div className="flex flex-col items-center">
            {gameState === 'idle' ? (
                <div className="text-center p-10 glass-card max-w-md">
                    <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Speed Match</h2>
                    <p className="text-slate-400 mb-6">Match 6 pairs of words before the time runs out!</p>
                    <button
                        onClick={initializeGame}
                        className="btn-primary px-8 py-3 text-lg w-full"
                    >
                        Start Game
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-4xl">
                    <div className="flex justify-between items-center mb-6 px-4">
                        <div className="flex items-center gap-2 text-xl font-bold text-white">
                            <Timer className={clsx("w-6 h-6", timeLeft < 10 ? "text-red-500 animate-pulse" : "text-emerald-400")} />
                            <span className="font-mono">{timeLeft}s</span>
                        </div>
                        <div className="text-xl font-bold text-yellow-400">
                            Score: {score}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {cards.map((card) => (
                                <motion.button
                                    key={card.id}
                                    layout
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{
                                        scale: card.isMatched ? 0.9 : 1,
                                        opacity: card.isMatched ? 0.5 : 1
                                    }}
                                    onClick={() => handleCardClick(card)}
                                    disabled={card.isMatched}
                                    className={clsx(
                                        "aspect-[4/3] rounded-xl p-2 flex items-center justify-center text-center font-medium transition-all text-sm md:text-base",
                                        card.isFlipped || card.isMatched
                                            ? card.isMatched
                                                ? "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500"
                                                : "bg-white text-slate-900 border-2 border-white"
                                            : "bg-white/5 text-transparent border-2 border-white/10 hover:bg-white/10"
                                    )}
                                >
                                    {(card.isFlipped || card.isMatched) && card.text}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    {gameState !== 'playing' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 text-center glass-card p-8"
                        >
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {gameState === 'won' ? '🎉 Level Complete!' : '⏰ Time\'s Up!'}
                            </h2>
                            <p className="text-slate-400 mb-6">
                                {gameState === 'won'
                                    ? `You matched all pairs with ${timeLeft}s remaining!`
                                    : "Keep practicing to improve your speed!"}
                            </p>
                            <button
                                onClick={initializeGame}
                                className="btn-primary px-8 py-3 inline-flex items-center gap-2"
                            >
                                <RefreshCw size={20} />
                                Play Again
                            </button>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SpeedMatchGame;
