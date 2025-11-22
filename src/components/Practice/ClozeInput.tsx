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

        const isCorrect = value.trim().toLowerCase() === answer.toLowerCase();
        setStatus(isCorrect ? 'correct' : 'incorrect');
        onComplete(isCorrect);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            checkAnswer();
            inputRef.current?.blur();
        }
    };

    return (
        <div className="inline-block relative mx-1 align-baseline">
            {/* Hidden span to measure width */}
            <span ref={spanRef} className="absolute opacity-0 pointer-events-none whitespace-pre font-medium text-lg">
                {value || answer}
            </span>

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

            {/* Reveal Answer if Incorrect */}
            <AnimatePresence>
                {status === 'incorrect' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 w-full text-center mt-1"
                    >
                        <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">
                            {answer}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClozeInput;
