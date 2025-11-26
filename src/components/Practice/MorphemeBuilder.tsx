import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, RefreshCw, Lightbulb, ArrowRight } from 'lucide-react';
import MorphologyViewer from '../Grammar/MorphologyViewer';

interface Segment {
    text: string;
    type: 'root' | 'prefix' | 'suffix' | 'infix';
    meaning: string;
}

interface MorphemeBuilderProps {
    word: string;
    translation: string;
    segments: Segment[];
    hint?: string;
    onComplete?: (isCorrect: boolean) => void;
}

const MorphemeBuilder: React.FC<MorphemeBuilderProps> = ({ word, translation, segments, hint, onComplete }) => {
    const [availableSegments, setAvailableSegments] = useState<Segment[]>([]);
    const [selectedSegments, setSelectedSegments] = useState<Segment[]>([]);
    const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [showHint, setShowHint] = useState(false);

    // Shuffle segments on mount
    useEffect(() => {
        const shuffled = [...segments].sort(() => Math.random() - 0.5);
        setAvailableSegments(shuffled);
        setSelectedSegments([]);
        setStatus('idle');
        setShowHint(false);
    }, [segments]);

    const handleSegmentClick = (segment: Segment, from: 'available' | 'selected') => {
        if (status === 'correct') return;

        if (from === 'available') {
            setAvailableSegments(prev => prev.filter(s => s !== segment));
            setSelectedSegments(prev => [...prev, segment]);
        } else {
            setSelectedSegments(prev => prev.filter(s => s !== segment));
            setAvailableSegments(prev => [...prev, segment]);
        }
        setStatus('idle');
    };

    const checkAnswer = () => {
        const currentWord = selectedSegments.map(s => s.text).join('');
        // Simple normalization: remove spaces and lowercase for comparison
        const isCorrect = currentWord.toLowerCase() === word.toLowerCase();

        setStatus(isCorrect ? 'correct' : 'incorrect');
        if (onComplete) onComplete(isCorrect);
    };

    const reset = () => {
        const shuffled = [...segments].sort(() => Math.random() - 0.5);
        setAvailableSegments(shuffled);
        setSelectedSegments([]);
        setStatus('idle');
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header / Question */}
            <div className="mb-8 text-center">
                <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Build the Word</h3>
                <p className="text-2xl text-white font-medium">"{translation}"</p>
            </div>

            {/* Answer Area */}
            <div className={clsx(
                "min-h-[80px] rounded-xl border-2 border-dashed flex flex-wrap items-center justify-center gap-2 p-4 mb-8 transition-colors",
                status === 'correct' ? "border-emerald-500 bg-emerald-500/10" :
                    status === 'incorrect' ? "border-red-500 bg-red-500/10" :
                        "border-white/20 bg-white/5"
            )}>
                <AnimatePresence>
                    {selectedSegments.length === 0 && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-slate-500 text-sm absolute"
                        >
                            Tap segments to build the word
                        </motion.p>
                    )}
                    {selectedSegments.map((seg, idx) => (
                        <motion.button
                            key={`${seg.text}-${idx}`}
                            layoutId={`seg-${seg.text}-${idx}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={() => handleSegmentClick(seg, 'selected')}
                            className={clsx(
                                "px-4 py-2 rounded-lg font-mono font-bold text-lg shadow-lg transition-all hover:scale-105",
                                seg.type === 'root' ? "bg-blue-500 text-white" :
                                    seg.type === 'prefix' ? "bg-purple-500 text-white" :
                                        "bg-orange-500 text-white"
                            )}
                        >
                            {seg.text}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            {/* Available Segments */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 min-h-[60px]">
                <AnimatePresence>
                    {availableSegments.map((seg, idx) => (
                        <motion.button
                            key={`${seg.text}-${idx}`}
                            layoutId={`seg-${seg.text}-${idx}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={() => handleSegmentClick(seg, 'available')}
                            className={clsx(
                                "px-4 py-2 rounded-lg font-mono font-bold text-lg border-2 transition-all hover:scale-105",
                                seg.type === 'root' ? "border-blue-500/50 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20" :
                                    seg.type === 'prefix' ? "border-purple-500/50 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20" :
                                        "border-orange-500/50 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"
                            )}
                        >
                            {seg.text}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {hint && (
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-yellow-400 transition-colors"
                            title="Show Hint"
                        >
                            <Lightbulb size={20} />
                        </button>
                    )}
                    <button
                        onClick={reset}
                        className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Reset"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>

                {status !== 'correct' && (
                    <button
                        onClick={checkAnswer}
                        disabled={selectedSegments.length === 0}
                        className={clsx(
                            "px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
                            selectedSegments.length > 0
                                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                                : "bg-white/5 text-slate-500 cursor-not-allowed"
                        )}
                    >
                        Check Answer <ArrowRight size={18} />
                    </button>
                )}
            </div>

            {/* Feedback & Explanation */}
            <AnimatePresence>
                {status === 'correct' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Correct!</h4>
                                <p className="text-emerald-400 text-sm">You built the word correctly.</p>
                            </div>
                        </div>

                        <div className="bg-black/20 rounded-xl p-4">
                            <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Morphological Breakdown</h5>
                            <MorphologyViewer segments={segments.map(s => ({ ...s, segment: s.text, gloss: s.meaning }))} />
                        </div>
                    </motion.div>
                )}

                {status === 'incorrect' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                    >
                        <AlertTriangle size={24} className="text-red-400" />
                        <p className="text-red-300">Not quite right. Try arranging the segments differently.</p>
                    </motion.div>
                )}

                {showHint && hint && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 text-center text-yellow-400 text-sm italic"
                    >
                        Hint: {hint}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MorphemeBuilder;
