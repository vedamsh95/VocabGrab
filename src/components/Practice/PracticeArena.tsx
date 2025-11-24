import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getActiveSet } from '../../lib/storage';
import SmartSentence from './SmartSentence';
import ClozeInput from './ClozeInput';
import ChoiceGroup from './ChoiceGroup';
import { motion } from 'framer-motion';

import { useProgressStore } from '../../store/useProgressStore';

const PracticeArena: React.FC = () => {
    const activeSet = getActiveSet();
    const [progress, setProgress] = useState(0);
    const addXP = useProgressStore(state => state.addXP);

    if (!activeSet) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold text-white">No Study Set Selected</h2>
                <Link to="/import" className="text-emerald-400 hover:underline">Import a set first</Link>
            </div>
        );
    }

    const exercises = activeSet.exercises || {};
    const fillInBlanks = exercises.fillInBlanks || [];
    const multipleChoice = exercises.multipleChoice || [];
    const totalQuestions = fillInBlanks.length + multipleChoice.length;

    const handleQuestionComplete = (isCorrect: boolean) => {
        if (isCorrect) {
            setProgress(prev => Math.min(prev + 1, totalQuestions));
            addXP(10); // Award 10 XP for correct answer
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-8 max-w-4xl mx-auto pb-32">
            {/* Header */}
            <header className="mb-10 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl py-4 z-20 border-b border-white/5 -mx-6 px-6 md:-mx-8 md:px-8">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white">{activeSet.title}</h1>
                        <p className="text-slate-400 text-sm">Practice Chapter 1</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm text-white font-bold">{progress} / {totalQuestions}</div>
                        <div className="text-xs text-slate-500">Completed</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/5 p-1">
                        <div
                            className="w-full h-full rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative"
                            style={{
                                background: `conic-gradient(#10b981 ${progress / totalQuestions * 360}deg, transparent 0deg)`
                            }}
                        >
                            <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="space-y-12">

                {/* Section 1: Fill in the Blanks */}
                {fillInBlanks.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm">1</span>
                            Fill in the Blanks
                        </h2>
                        <div className="space-y-6">
                            {fillInBlanks.map((ex, i) => {
                                // Split question by "___" to insert input
                                const parts = ex.question.split('___');
                                return (
                                    <motion.div
                                        key={ex.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-card p-6 border-l-4 border-l-emerald-500/50"
                                    >
                                        <div className="flex items-baseline flex-wrap gap-1 text-lg leading-relaxed">
                                            <span className="text-slate-400 font-mono text-sm mr-2">{i + 1}.</span>
                                            <SmartSentence sentence={parts[0]} />
                                            <ClozeInput answer={ex.answer} onComplete={handleQuestionComplete} />
                                            {parts[1] && <SmartSentence sentence={parts[1]} />}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Section 2: Multiple Choice */}
                {multipleChoice.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm">2</span>
                            Multiple Choice
                        </h2>
                        <div className="space-y-6">
                            {multipleChoice.map((ex, i) => (
                                <motion.div
                                    key={ex.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (fillInBlanks.length + i) * 0.1 }}
                                    className="glass-card p-6 border-l-4 border-l-blue-500/50"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-slate-400 font-mono text-sm mt-1">{fillInBlanks.length + i + 1}.</span>
                                        <div className="flex-1">
                                            <SmartSentence sentence={ex.question} className="mb-4" />
                                            <ChoiceGroup
                                                options={ex.options}
                                                correctAnswer={ex.answer}
                                                onComplete={handleQuestionComplete}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};

export default PracticeArena;
