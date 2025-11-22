import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Check, X, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getActiveSet } from '../../lib/storage';


const FlashcardDeck: React.FC = () => {
    const activeSet = getActiveSet();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [score, setScore] = useState({ correct: 0, incorrect: 0 });

    if (!activeSet) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold text-white">No Study Set Selected</h2>
                <Link to="/import" className="text-emerald-400 hover:underline">Import a set first</Link>
            </div>
        );
    }

    const cards = activeSet.flashcards;

    const handleNext = (isCorrect: boolean) => {
        setScore(prev => ({
            ...prev,
            [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1
        }));

        setIsFlipped(false);

        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setCompleted(true);
            }
        }, 300);
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setCompleted(false);
        setScore({ correct: 0, incorrect: 0 });
    };

    if (cards.length === 0) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold text-white">No Flashcards Found</h2>
                <p className="text-slate-400">This set doesn't have any flashcards.</p>
                <Link to="/dashboard" className="text-emerald-400 hover:underline mt-4 inline-block">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 flex flex-col overflow-hidden">
            <div className="max-w-md mx-auto w-full flex-1 flex flex-col relative">
                <div className="mb-8 flex items-center justify-between z-10">
                    <Link to="/dashboard" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-white">{activeSet.title}</h1>
                        <p className="text-slate-400 text-sm">Card {currentIndex + 1} of {cards.length}</p>
                    </div>
                    <div className="w-9"></div>
                </div>

                {completed ? (
                    <div className="flex-1 flex flex-col items-center justify-center glass-card p-8 text-center z-10">
                        <h2 className="text-3xl font-bold text-white mb-4">Session Complete!</h2>
                        <div className="flex gap-8 mb-8">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-emerald-400">{score.correct}</div>
                                <div className="text-slate-500 text-sm uppercase tracking-wide">Correct</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-red-400">{score.incorrect}</div>
                                <div className="text-slate-500 text-sm uppercase tracking-wide">Incorrect</div>
                            </div>
                        </div>
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors font-medium shadow-lg shadow-emerald-500/20"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Restart Deck
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative w-full aspect-[3/4] perspective-1000 mb-8">
                            <motion.div
                                className="w-full h-full relative preserve-3d transition-all duration-500"
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                            >
                                {/* Front (Target Language) */}
                                <div
                                    className="absolute w-full h-full backface-hidden glass-card border border-white/10 flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-xl cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => setIsFlipped(true)}
                                >
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                                        <Layers className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Tap to flip</span>
                                    {/* Swapped: Front shows Target Language (which was 'back' in schema usually, but let's assume 'front' is Question/Target for now based on user request 'front page should be language leaning') */}
                                    {/* Actually user said: "front page should be the language leaning and flipped should be english" */}
                                    {/* Usually 'front' in JSON is 'Apple' (English) and 'back' is 'Manzana' (Spanish). */}
                                    {/* So we should show 'back' (Target) on the Front of the card, and 'front' (English) on the Back of the card. */}
                                    <h3 className="text-4xl font-bold text-white">{cards[currentIndex].back}</h3>
                                </div>

                                {/* Back (English/Native) */}
                                <div
                                    className="absolute w-full h-full backface-hidden glass-card border border-emerald-500/30 flex flex-col items-center justify-center p-8 text-center bg-emerald-900/20 backdrop-blur-xl cursor-pointer"
                                    style={{ transform: 'rotateY(180deg)' }}
                                    onClick={() => setIsFlipped(false)}
                                >
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">Meaning</span>
                                    <h3 className="text-4xl font-bold text-white">{cards[currentIndex].front}</h3>
                                </div>
                            </motion.div>
                        </div>

                        {/* Explicit Controls */}
                        <div className="flex gap-4 w-full max-w-xs">
                            <button
                                onClick={() => handleNext(false)}
                                className="flex-1 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                Incorrect
                            </button>
                            <button
                                onClick={() => handleNext(true)}
                                className="flex-1 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                Correct
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlashcardDeck;
