import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, RotateCcw, LayoutGrid, Type, ListChecks, Zap, Puzzle } from 'lucide-react';
import { getActiveSet } from '../../lib/storage';
import { useProgressStore } from '../../store/useProgressStore';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

import SmartSentence from './SmartSentence';
import ClozeInput from './ClozeInput';
import ChoiceGroup from './ChoiceGroup';
import SpeedMatchGame from './SpeedMatchGame';
import SentenceBuilderGame from './SentenceBuilderGame';

type Tab = 'vocab' | 'fill' | 'choice' | 'speed' | 'builder';

const PracticeArena: React.FC = () => {
    const activeSet = getActiveSet();
    const [activeTab, setActiveTab] = useState<Tab>('vocab');
    const [progress, setProgress] = useState(0);
    const addXP = useProgressStore(state => state.addXP);
    const [resetKey, setResetKey] = useState(0);

    // Stable Vocab List (Fixes infinite loop)
    const shuffledVocab = useMemo(() => {
        if (!activeSet?.vocabulary) return [];
        return [...activeSet.vocabulary].sort(() => 0.5 - Math.random());
    }, [activeSet, resetKey]);

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

    // Calculate total for current tab
    const getTotalQuestions = () => {
        switch (activeTab) {
            case 'vocab': return shuffledVocab.length;
            case 'fill': return fillInBlanks.length;
            case 'choice': return multipleChoice.length;
            default: return 0; // Games handle their own progress
        }
    };

    const handleQuestionComplete = (isCorrect: boolean) => {
        if (isCorrect) {
            setProgress(prev => Math.min(prev + 1, getTotalQuestions()));
            addXP(10);
        }
    };

    const handleResetAll = () => {
        setResetKey(prev => prev + 1);
        setProgress(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const tabs = [
        { id: 'vocab', label: 'Vocabulary', icon: LayoutGrid },
        { id: 'fill', label: 'Fill Blanks', icon: Type },
        { id: 'choice', label: 'Multiple Choice', icon: ListChecks },
        { id: 'speed', label: 'Speed Match', icon: Zap },
        { id: 'builder', label: 'Builder', icon: Puzzle },
    ];

    return (
        <div className="min-h-screen p-6 md:p-8 max-w-5xl mx-auto pb-32">
            {/* Header */}
            <header className="mb-8 sticky top-0 bg-background/95 backdrop-blur-xl py-4 z-20 border-b border-white/5 -mx-6 px-6 md:-mx-8 md:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-400" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white">{activeSet.title}</h1>
                            <p className="text-slate-400 text-sm">Practice Arena</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleResetAll}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                            title="Reset All Exercises"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>

                        {['vocab', 'fill', 'choice'].includes(activeTab) && (
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm text-white font-bold">{progress} / {getTotalQuestions()}</div>
                                    <div className="text-xs text-slate-500">Completed</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 p-1">
                                    <div
                                        className="w-full h-full rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative"
                                        style={{
                                            background: `conic-gradient(#10b981 ${progress / getTotalQuestions() * 360}deg, transparent 0deg)`
                                        }}
                                    >
                                        <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id as Tab); setProgress(0); }}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                    isActive
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </header>

            <div className="min-h-[400px]" key={resetKey}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Tab Content */}
                        {activeTab === 'vocab' && (
                            <div className="glass-card overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="p-4 text-sm font-medium text-slate-400 w-1/3">Definition / Native</th>
                                            <th className="p-4 text-sm font-medium text-slate-400">Target Word</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shuffledVocab.map((word, i) => (
                                            <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-slate-200 font-medium">
                                                    {word.translation}
                                                </td>
                                                <td className="p-4">
                                                    <ClozeInput
                                                        answer={word.word}
                                                        onComplete={handleQuestionComplete}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'fill' && (
                            <div className="space-y-6">
                                {fillInBlanks.length === 0 ? (
                                    <div className="text-center text-slate-500 py-10">No Fill-in-Blank exercises available.</div>
                                ) : (
                                    fillInBlanks.map((ex, i) => {
                                        const parts = ex.question.split('___');
                                        return (
                                            <div key={ex.id} className="glass-card p-6 border-l-4 border-l-emerald-500/50">
                                                <div className="flex items-baseline flex-wrap gap-1 text-lg leading-relaxed">
                                                    <span className="text-slate-400 font-mono text-sm mr-2">{i + 1}.</span>
                                                    <SmartSentence sentence={parts[0]} />
                                                    <ClozeInput answer={ex.answer} onComplete={handleQuestionComplete} />
                                                    {parts[1] && <SmartSentence sentence={parts[1]} />}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {activeTab === 'choice' && (
                            <div className="space-y-6">
                                {multipleChoice.length === 0 ? (
                                    <div className="text-center text-slate-500 py-10">No Multiple Choice exercises available.</div>
                                ) : (
                                    multipleChoice.map((ex, i) => (
                                        <div key={ex.id} className="glass-card p-6 border-l-4 border-l-blue-500/50">
                                            <div className="flex items-start gap-3">
                                                <span className="text-slate-400 font-mono text-sm mt-1">{i + 1}.</span>
                                                <div className="flex-1">
                                                    <SmartSentence sentence={ex.question} className="mb-4" />
                                                    <ChoiceGroup
                                                        options={ex.options}
                                                        correctAnswer={ex.answer}
                                                        onComplete={handleQuestionComplete}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'speed' && (
                            <SpeedMatchGame vocabulary={activeSet.vocabulary} />
                        )}

                        {activeTab === 'builder' && (
                            <SentenceBuilderGame vocabulary={activeSet.vocabulary} />
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PracticeArena;
