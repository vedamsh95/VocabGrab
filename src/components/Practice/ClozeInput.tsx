import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface ClozeInputProps {
    answer: string;
    onComplete: (isCorrect: boolean) => void;
}

const ClozeInput: React.FC<ClozeInputProps> = ({ answer, onComplete }) => {
    const [value, setValue] = useState('');
    const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const inputRef = useRef<HTMLInputElement>(null);
    const spanRef = useRef<HTMLSpanElement>(null);
    const [width, setWidth] = useState(60);

    // Auto-resize input based on content
    useEffect(() => {
        if (spanRef.current) {
            setWidth(Math.max(60, spanRef.current.offsetWidth + 20));
        }
    }, [value]);

    const checkAnswer = () => {
        if (status !== 'idle' || !value.trim()) return;

        // Strip parenthetical metadata (e.g., "aus sehen (accusative)") -> "aus sehen"
        const cleanAnswer = answer.replace(/\s*\(.*?\)/g, '').trim();
        const isCorrect = value.trim().toLowerCase() === cleanAnswer.toLowerCase();

        setStatus(isCorrect ? 'correct' : 'incorrect');
        onComplete(isCorrect);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            checkAnswer();
            inputRef.current?.blur();
        }
    };

    const handleReset = () => {
        setValue('');
        setStatus('idle');
        inputRef.current?.focus();
    };

    return (
        <div className="inline-flex items-center gap-2 relative mx-1 align-baseline">
            {/* Hidden span to measure width */}
            <span ref={spanRef} className="absolute opacity-0 pointer-events-none whitespace-pre font-medium text-lg">
                {value || answer}
            </span>

            <div className="relative">
                <motion.div
                    animate={status === 'incorrect' ? { x: [-5, 5, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={checkAnswer}
                        disabled={status !== 'idle'}
                        style={{ width: `${width}px` }}
                        className={clsx(
                            "bg-transparent border-b-2 outline-none text-center font-medium text-lg transition-all duration-300",
                            status === 'idle' && "border-slate-600 text-white focus:border-emerald-500",
                            status === 'correct' && "border-emerald-500 text-emerald-400 font-bold",
                            status === 'incorrect' && "border-red-500 text-red-400"
                        )}
                        autoComplete="off"
                    />
                </motion.div>
            </div>

            {/* Feedback & Controls */}
            <AnimatePresence>
                {status !== 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2"
                    >
                        {status === 'incorrect' && (
                            <span className="text-sm text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded whitespace-nowrap">
                                {answer}
                            </span>
                        )}

                        <button
                            onClick={handleReset}
                            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Try Again"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
                                <path d="M3 3v9h9" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClozeInput;
