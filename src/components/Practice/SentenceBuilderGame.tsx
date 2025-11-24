import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ArrowRight } from 'lucide-react';
import { useProgressStore } from '../../store/useProgressStore';
import type { VocabItem } from '../../types/schema';

interface SentenceBuilderGameProps {
    vocabulary: VocabItem[];
}

const SentenceBuilderGame: React.FC<SentenceBuilderGameProps> = ({ vocabulary }) => {
    const [currentSentence, setCurrentSentence] = useState<VocabItem | null>(null);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [builtSentence, setBuiltSentence] = useState<string[]>([]);
    const [status, setStatus] = useState<'playing' | 'correct' | 'incorrect'>('playing');
    const [showAnswer, setShowAnswer] = useState(false);
    const addXP = useProgressStore(state => state.addXP);

    const loadNewSentence = () => {
        // Filter items that have example sentences
        const candidates = vocabulary.filter(v => v.exampleSentence && v.exampleSentence.length > 10);
        if (candidates.length === 0) return;

        const randomItem = candidates[Math.floor(Math.random() * candidates.length)];
        setCurrentSentence(randomItem);
        setShowAnswer(false);

        // Tokenize and shuffle
        // Keep punctuation attached to words for the blocks, or strip it?
        // User wants to build the sentence. Usually blocks have punctuation or it's ignored.
        // Let's strip punctuation for the BLOCKS to make it cleaner, but we need to match against the stripped target.
        const words = randomItem.exampleSentence!
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
            .split(/\s+/)
            .filter((w: string) => w.length > 0);

        setAvailableWords(words.sort(() => 0.5 - Math.random()));
        setBuiltSentence([]);
        setStatus('playing');
    };

    useEffect(() => {
        loadNewSentence();
    }, [vocabulary]);

    const handleWordClick = (word: string, index: number, from: 'pool' | 'built') => {
        if (status === 'correct') return;

        if (from === 'pool') {
            const newPool = [...availableWords];
            newPool.splice(index, 1);
            setAvailableWords(newPool);
            setBuiltSentence([...builtSentence, word]);
        } else {
            const newBuilt = [...builtSentence];
            newBuilt.splice(index, 1);
            setBuiltSentence(newBuilt);
            setAvailableWords([...availableWords, word]);
        }
        setStatus('playing');
    };

    const checkAnswer = () => {
        if (!currentSentence) return;

        const target = currentSentence.exampleSentence!
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
            .toLowerCase()
            .split(/\s+/)
            .join(' ');

        const attempt = builtSentence.join(' ').toLowerCase();

        if (attempt === target) {
            setStatus('correct');
            addXP(20);
        } else {
            setStatus('incorrect');
        }
    };

    const revealAnswer = () => {
        setShowAnswer(true);
        setStatus('incorrect'); // Mark as incorrect if revealed
    };

    if (!currentSentence) {
        return (
            <div className="text-center p-10">
                <p className="text-slate-400">No example sentences found in this set.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="glass-card p-8 mb-8 text-center">
                <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-4">Build the Sentence</h3>
                <p className="text-2xl font-bold text-white mb-2">
                    Using: <span className="text-emerald-400">"{currentSentence.word}"</span>
                </p>
                <p className="text-slate-400 text-sm mb-4">({currentSentence.translation})</p>

                <div className="h-1 w-20 bg-emerald-500/30 mx-auto rounded-full my-4" />

                {/* Answer Area */}
                <div className="min-h-[80px] bg-white/5 rounded-xl p-4 flex flex-wrap gap-2 justify-center items-center border-2 border-dashed border-white/10 transition-colors duration-300"
                    style={{ borderColor: status === 'correct' ? '#10b981' : status === 'incorrect' ? '#ef4444' : '' }}
                >
                    {builtSentence.length === 0 && (
                        <span className="text-slate-500 text-sm">Tap words to build the sentence</span>
                    )}
                    {builtSentence.map((word, i) => (
                        <motion.button
                            layoutId={`word-${word}-${i}`}
                            key={`built-${i}`}
                            onClick={() => handleWordClick(word, i, 'built')}
                            className="px-3 py-1.5 bg-white text-slate-900 rounded-lg font-medium shadow-lg hover:bg-slate-200"
                        >
                            {word}
                        </motion.button>
                    ))}
                </div>

                {/* Feedback / Revealed Answer */}
                {(status === 'incorrect' || showAnswer) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                    >
                        {showAnswer ? (
                            <div>
                                <p className="text-slate-400 text-xs uppercase mb-1">Correct Sentence</p>
                                <p className="text-white font-medium">{currentSentence.exampleSentence}</p>
                            </div>
                        ) : (
                            <p className="text-red-400 text-sm">Incorrect order. Try again!</p>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Word Pool */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
                {availableWords.map((word, i) => (
                    <motion.button
                        layoutId={`word-${word}-${i}`}
                        key={`pool-${i}`}
                        onClick={() => handleWordClick(word, i, 'pool')}
                        className="px-3 py-1.5 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 border border-white/10"
                    >
                        {word}
                    </motion.button>
                ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
                {status === 'correct' ? (
                    <button
                        onClick={loadNewSentence}
                        className="btn-primary px-8 py-3 flex items-center gap-2"
                    >
                        Next Sentence <ArrowRight size={20} />
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={revealAnswer}
                            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
                        >
                            Reveal Answer
                        </button>
                        <button
                            onClick={checkAnswer}
                            disabled={builtSentence.length === 0}
                            className={clsx(
                                "btn-primary px-8 py-3 flex items-center gap-2",
                                status === 'incorrect' && "bg-red-500 hover:bg-red-600"
                            )}
                        >
                            Check Answer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SentenceBuilderGame;
