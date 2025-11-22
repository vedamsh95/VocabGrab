import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check, X } from 'lucide-react';

interface ChoiceGroupProps {
    options: string[];
    correctAnswer: string;
    onComplete: (isCorrect: boolean) => void;
}

const ChoiceGroup: React.FC<ChoiceGroupProps> = ({ options, correctAnswer, onComplete }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSelect = (option: string) => {
        if (isSubmitted) return;
        setSelected(option);
        setIsSubmitted(true);
        onComplete(option === correctAnswer);
    };

    return (
        <div className="flex flex-wrap gap-3 mt-4">
            {options.map((option, index) => {
                const isSelected = selected === option;
                const isCorrect = option === correctAnswer;

                // Determine state for styling
                let state = 'idle';
                if (isSubmitted) {
                    if (isCorrect) state = 'correct';
                    else if (isSelected && !isCorrect) state = 'incorrect';
                    else state = 'disabled';
                }

                return (
                    <motion.button
                        key={index}
                        onClick={() => handleSelect(option)}
                        disabled={isSubmitted}
                        whileHover={!isSubmitted ? { scale: 1.02 } : {}}
                        whileTap={!isSubmitted ? { scale: 0.98 } : {}}
                        className={clsx(
                            "px-4 py-2 rounded-xl border text-sm font-medium transition-all flex items-center gap-2",
                            state === 'idle' && "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-emerald-500/30",
                            state === 'correct' && "bg-emerald-500/20 border-emerald-500 text-emerald-400",
                            state === 'incorrect' && "bg-red-500/20 border-red-500 text-red-400",
                            state === 'disabled' && "opacity-50 cursor-not-allowed border-transparent"
                        )}
                    >
                        {option}
                        {state === 'correct' && <Check className="w-4 h-4" />}
                        {state === 'incorrect' && <X className="w-4 h-4" />}
                    </motion.button>
                );
            })}
        </div>
    );
};

export default ChoiceGroup;
