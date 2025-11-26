import React, { useState } from 'react';
import { getActiveSet } from '../../lib/storage';
import { Book, Lightbulb, AlertTriangle, CheckCircle, Play, Pause, GraduationCap } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useTTS } from '../../hooks/useTTS';
import SmartSentence from '../Practice/SmartSentence';
import MorphologyViewer from './MorphologyViewer';
import MorphemeBuilder from '../Practice/MorphemeBuilder';

const GrammarLessonView: React.FC = () => {
    const activeSet = getActiveSet();
    const lessons = activeSet?.grammarLessons || [];
    const [currentLessonIndex] = useState(0);
    const [currentSection, setCurrentSection] = useState<'hook' | 'inductive' | 'deductive' | 'contrastive' | 'practice'>('deductive');
    const [practiceState, setPracticeState] = useState<Record<number, { selected: string, isCorrect: boolean }>>({});
    const { speak, isSpeaking, stop } = useTTS();

    const handleOptionSelect = (exerciseIndex: number, option: string, correctAnswer: string) => {
        if (practiceState[exerciseIndex]) return; // Prevent changing answer

        const isCorrect = option === correctAnswer;
        setPracticeState(prev => ({
            ...prev,
            [exerciseIndex]: { selected: option, isCorrect }
        }));
    };

    if (lessons.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <GraduationCap size={40} className="text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No Grammar Lessons</h2>
                <p className="text-slate-400 max-w-md">
                    This study set doesn't have any grammar lessons yet.
                    Go to the Import Studio and generate a "Grammar Lesson" to get started.
                </p>
            </div>
        );
    }

    const lesson = lessons[currentLessonIndex];
    const { lesson_meta, pedagogy, practice } = lesson;

    const sections = [
        { id: 'hook', label: 'Scenario', icon: Book },
        { id: 'inductive', label: 'Examples', icon: Lightbulb },
        { id: 'deductive', label: 'Rules', icon: GraduationCap },
        { id: 'contrastive', label: 'Pitfalls', icon: AlertTriangle },
        { id: 'practice', label: 'Practice', icon: CheckCircle },
    ] as const;

    return (
        <div className="h-full flex flex-col bg-[#0a0c14]">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-black/20">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                            {lesson_meta.cefr_level} Grammar
                        </span>
                        <h1 className="text-2xl font-bold text-white mt-2">{lesson_meta.topic_name}</h1>
                        <p className="text-slate-400 text-sm mt-1">{lesson_meta.learning_objective}</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setCurrentSection(section.id)}
                            className={clsx(
                                "flex-1 min-w-[100px] py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                                currentSection === section.id
                                    ? "bg-emerald-500 text-white shadow-lg"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <section.icon size={16} />
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-3xl mx-auto"
                    >
                        {currentSection === 'hook' && (
                            <div className="space-y-6">
                                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Book size={20} className="text-emerald-400" />
                                        Context
                                    </h3>
                                    <p className="text-slate-300 mb-6 italic border-l-2 border-emerald-500/30 pl-4">
                                        {pedagogy.hook.description}
                                    </p>
                                    <div className="bg-black/30 rounded-xl p-6 border border-white/5 relative group">
                                        <button
                                            onClick={() => isSpeaking ? stop() : speak(pedagogy.hook.content, lesson_meta.target_language)}
                                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                        >
                                            {isSpeaking ? <Pause size={20} /> : <Play size={20} />}
                                        </button>
                                        <div className="text-lg text-white leading-relaxed font-medium">
                                            <SmartSentence sentence={pedagogy.hook.content} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentSection === 'inductive' && (
                            <div className="space-y-6">
                                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Lightbulb size={20} className="text-yellow-400" />
                                        Discover the Pattern
                                    </h3>
                                    <p className="text-slate-300 mb-6">{pedagogy.inductive_discovery.description}</p>

                                    <div className="space-y-4">
                                        {pedagogy.inductive_discovery.examples.map((ex, idx) => (
                                            <div key={idx} className="bg-black/30 rounded-xl p-4 border border-white/5 flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-lg text-white mb-1">
                                                        {ex.sentence}
                                                    </p>
                                                    <p className="text-slate-400 text-sm">{ex.translation}</p>
                                                    {ex.morphology && (
                                                        <div className="mt-3">
                                                            <MorphologyViewer segments={ex.morphology} />
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => speak(ex.sentence, lesson_meta.target_language)}
                                                    className="ml-auto p-2 text-slate-500 hover:text-white transition-colors"
                                                >
                                                    <Play size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentSection === 'deductive' && (
                            <div className="space-y-6">
                                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <GraduationCap size={20} className="text-blue-400" />
                                        The Rules
                                    </h3>

                                    <div className="mb-8">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Morphology (Form)</h4>
                                        <p className="text-slate-300 mb-4">{pedagogy.deductive_explanation.morphology.description}</p>
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-blue-100 font-mono text-center text-lg">
                                            {pedagogy.deductive_explanation.morphology.formula}
                                        </div>
                                        {pedagogy.deductive_explanation.morphology.exceptions.length > 0 && (
                                            <div className="mt-4">
                                                <span className="text-xs text-red-400 font-bold uppercase">Exceptions:</span>
                                                <ul className="list-disc list-inside text-slate-300 mt-1 text-sm">
                                                    {pedagogy.deductive_explanation.morphology.exceptions.map((exc, i) => (
                                                        <li key={i}>{exc}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Pragmatics (Usage)</h4>
                                        <p className="text-slate-300 mb-2">{pedagogy.deductive_explanation.pragmatics.description}</p>
                                        <div className="bg-white/5 rounded-xl p-4 text-slate-300 text-sm italic">
                                            "{pedagogy.deductive_explanation.pragmatics.usage_notes}"
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentSection === 'contrastive' && (
                            <div className="space-y-6">
                                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <AlertTriangle size={20} className="text-orange-400" />
                                        Common Pitfalls
                                    </h3>
                                    <p className="text-slate-300 mb-6">{pedagogy.contrastive_analysis.description}</p>

                                    <div className="space-y-4">
                                        {pedagogy.contrastive_analysis.common_pitfalls.map((pitfall, idx) => (
                                            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/30 rounded-xl p-4 border border-white/5">
                                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase mb-1">
                                                        <span className="w-4 h-4 rounded-full border border-red-400 flex items-center justify-center">✕</span>
                                                        Incorrect
                                                    </div>
                                                    <p className="text-white">{pitfall.incorrect}</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
                                                        <span className="w-4 h-4 rounded-full border border-emerald-400 flex items-center justify-center">✓</span>
                                                        Correct
                                                    </div>
                                                    <p className="text-white">{pitfall.correct}</p>
                                                </div>
                                                <div className="md:col-span-2 text-sm text-slate-400 italic mt-1">
                                                    💡 {pitfall.explanation}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentSection === 'practice' && (
                            <div className="space-y-6">
                                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <CheckCircle size={20} className="text-emerald-400" />
                                        Test Your Knowledge
                                    </h3>

                                    <div className="space-y-6">
                                        {practice.scaffolded_exercises.map((ex, idx) => (
                                            <div key={idx} className="bg-black/30 rounded-xl p-6 border border-white/5">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-xs font-bold text-slate-500 uppercase">Exercise {idx + 1}</span>
                                                    <span className="text-xs px-2 py-1 rounded bg-white/10 text-slate-300">{ex.type.replace('_', ' ')}</span>
                                                </div>

                                                {ex.type === 'morpheme_builder' ? (
                                                    // @ts-ignore - TS doesn't fully infer the union type discrimination here yet
                                                    <MorphemeBuilder
                                                        word={ex.word}
                                                        translation={ex.translation}
                                                        segments={ex.segments}
                                                        hint={ex.hint}
                                                    />
                                                ) : (
                                                    <>
                                                        <p className="text-lg text-white mb-6 font-medium">{ex.question}</p>

                                                        {ex.options ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {ex.options.map((opt, i) => {
                                                                    const state = practiceState[idx];
                                                                    const isSelected = state?.selected === opt;
                                                                    const isCorrectAnswer = opt === ex.correct_answer;

                                                                    let btnClass = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10";

                                                                    if (state) {
                                                                        if (isCorrectAnswer) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                                                                        else if (isSelected && !state.isCorrect) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                                                                        else btnClass = "bg-white/5 border-white/10 text-slate-500 opacity-50";
                                                                    }

                                                                    return (
                                                                        <button
                                                                            key={i}
                                                                            onClick={() => handleOptionSelect(idx, opt, ex.correct_answer || '')}
                                                                            disabled={!!state}
                                                                            className={clsx(
                                                                                "p-3 rounded-lg border text-left transition-all",
                                                                                btnClass
                                                                            )}
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                {opt}
                                                                                {state && isCorrectAnswer && <CheckCircle size={16} />}
                                                                                {state && isSelected && !state.isCorrect && <AlertTriangle size={16} />}
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                placeholder="Type your answer..."
                                                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500/50 focus:outline-none"
                                                            />
                                                        )}

                                                        <div className="mt-4 flex justify-end">
                                                            <button className="text-xs text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1">
                                                                <Lightbulb size={12} /> Show Hint
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GrammarLessonView;
