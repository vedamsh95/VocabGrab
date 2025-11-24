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
    const addXP = useProgressStore(state => state.addXP);

    const loadNewSentence = () => {
        // Filter items that have example sentences
        const candidates = vocabulary.filter(v => v.exampleSentence && v.exampleSentence.length > 10);
        if (candidates.length === 0) return;

        const randomItem = candidates[Math.floor(Math.random() * candidates.length)];
        setCurrentSentence(randomItem);

        // Tokenize and shuffle
        // Simple split by space, removing punctuation for matching logic but keeping for display if possible
        // For simplicity, let's just split by space and strip punctuation for the "blocks"
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
            .split(/\s+/)
            .join(' ');

        const attempt = builtSentence.join(' ');

        if (attempt.toLowerCase() === target.toLowerCase()) {
            setStatus('correct');
            addXP(20);
        } else {
            setStatus('incorrect');
        }
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
                <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-4">Translate this sentence</h3>
                <p className="text-2xl font-bold text-white mb-2">
                    {/* We don't have the English translation of the sentence in the schema usually, 
                        so we might have to rely on the user knowing the context or just building it.
                        Wait, the schema usually has 'translation' for the word, but not always for the example sentence.
                        Let's check if we can infer or just show the sentence context.
                        Actually, for this game to work well, we need the translation. 
                        If it's missing, we might show the word translation as a hint.
                    */}
                    "{currentSentence.translation}" (Context)
                </p>
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
            </div>

            {/* Word Pool */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
                {availableWords.map((word, i) => (
                    <motion.button
                        layoutId={`word-${word}-${i}`} // Unique layout ID issue if duplicates exist, simple fix:
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
                    <button
                        onClick={checkAnswer}
                        disabled={builtSentence.length === 0}
                        className={clsx(
                            "btn-primary px-8 py-3 flex items-center gap-2",
                            status === 'incorrect' && "bg-red-500 hover:bg-red-600"
                        )}
                    >
                        {status === 'incorrect' ? 'Try Again' : 'Check Answer'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SentenceBuilderGame;
