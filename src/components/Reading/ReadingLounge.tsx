import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { BookOpen, MessageCircle, Newspaper, Info, X, Eye, EyeOff, Play, Pause, Loader2, Check } from 'lucide-react';
import { TranslationClient } from '../../lib/translationClient';
import { GrammarClient } from '../../lib/grammarClient';
import type { ReadingContent, AnalyzedSentence } from '../../types/schema';
import Logo from '../Common/Logo';

import { useReadStore } from '../../store/useReadStore';
import { useProgressStore } from '../../store/useProgressStore';
import { getLanguageCode, getBestVoice } from '../../lib/languages';

interface ReadingLoungeProps {
    content: ReadingContent;
}

const ReadingLounge: React.FC<ReadingLoungeProps> = ({ content }) => {
    const [selectedSentence, setSelectedSentence] = useState<AnalyzedSentence | null>(null);
    const [xRayMode, setXRayMode] = useState(false);
    const [selectionMode, setSelectionMode] = useState<'sentence' | 'word'>('sentence');
    const [selectedWord, setSelectedWord] = useState<{ word: string; translation: string; grammarTip?: string } | null>(null);

    // Karaoke Store
    const { isPlaying, activeSegmentId, play, pause, setSegment } = useReadStore();
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const isChat = content.mode === 'Conversation';

    const [modelLoading, setModelLoading] = useState(false);
    const [modelProgress, setModelProgress] = useState<{ status: string; file: string; progress: number } | null>(null);
    const translationClientRef = useRef<TranslationClient | null>(null);
    const grammarClientRef = useRef<GrammarClient | null>(null);

    // Initialize Speech Synthesis & Translation Client
    useEffect(() => {
        synthRef.current = window.speechSynthesis;

        // Init Translation Client
        translationClientRef.current = new TranslationClient((data) => {
            setModelLoading(true);
            setModelProgress(data);
            if (data.status === 'ready') {
                setModelLoading(false);
                setModelProgress(null);
            }
        });

        // Init Grammar Client (for context explanation)
        grammarClientRef.current = new GrammarClient((data) => {
            if (data.status === 'loading') {
                setModelLoading(true);
            } else if (data.status === 'complete' || data.status === 'ready') {
                setModelLoading(false);
            }
        });

        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
            translationClientRef.current?.terminate();
        };
    }, []);

    // Handle Playback Logic
    useEffect(() => {
        if (isPlaying && !activeSegmentId) {
            // Start from beginning if nothing selected
            if (content.content.length > 0) {
                setSegment(content.content[0].id);
            }
        } else if (!isPlaying) {
            synthRef.current?.cancel();
        }
    }, [isPlaying, activeSegmentId, content.content, setSegment]);

    // Speak Active Segment
    useEffect(() => {
        if (isPlaying && activeSegmentId && synthRef.current) {
            const segment = content.content.find(s => s.id === activeSegmentId);
            if (segment) {
                // Cancel previous
                synthRef.current.cancel();

                const utterance = new SpeechSynthesisUtterance(segment.sentence);
                utteranceRef.current = utterance;

                // Set Language based on content
                const langCode = getLanguageCode(content.targetLanguage || 'German'); // Fallback for old sets
                utterance.lang = langCode;

                const voice = getBestVoice(langCode);
                if (voice) utterance.voice = voice;

                utterance.rate = 0.9; // Slightly slower for learning

                utterance.onend = () => {
                    // Move to next segment
                    const currentIndex = content.content.findIndex(s => s.id === activeSegmentId);
                    if (currentIndex < content.content.length - 1) {
                        setSegment(content.content[currentIndex + 1].id);
                    } else {
                        pause();
                        setSegment(null);
                    }
                };

                synthRef.current.speak(utterance);
            }
        }
    }, [activeSegmentId, isPlaying, content.content, setSegment, pause]);

    // Auto-scroll to active segment
    const activeRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [activeSegmentId]);


    const handleTogglePlay = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const handleWordClick = async (word: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedWord({
            word: word,
            translation: "Translating...",
            grammarTip: "Neural AI"
        });

        try {
            // Revert to TranslationClient (NLLB) for better accuracy
            if (translationClientRef.current) {
                const translation = await translationClientRef.current.translate(word);
                setModelLoading(false);
                setModelProgress(null);

                setSelectedWord({
                    word: word,
                    translation: translation,
                    grammarTip: "Direct Translation"
                });

                // Optional: We could still use GrammarClient for a secondary "Context Tip" if desired, 
                // but for now let's stick to the reliable translation.
            } else {
                // Fallback
                setSelectedWord({
                    word: word,
                    translation: "Model not ready",
                    grammarTip: "Offline"
                });
            }
        } catch (err) {
            console.error(err);
            setSelectedWord({
                word: word,
                translation: "Error translating",
                grammarTip: "Offline Mode"
            });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6">
            {/* Main Reader Area */}
            <div className="flex-1 glass-panel rounded-2xl p-6 overflow-y-auto relative">
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#02040a]/80 backdrop-blur-md py-2 z-10 border-b border-white/5">
                    <Logo size="small" />
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                            {content.mode === 'Conversation' && <MessageCircle size={24} />}
                            {content.mode === 'Story' && <BookOpen size={24} />}
                            {content.mode === 'News' && <Newspaper size={24} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{content.title}</h2>
                            <div className="flex gap-2 mt-1">
                                <button
                                    onClick={() => { setSelectionMode('sentence'); setSelectedWord(null); }}
                                    className={clsx("text-xs px-2 py-0.5 rounded transition-colors", selectionMode === 'sentence' ? "bg-white/20 text-white" : "text-slate-500 hover:text-slate-300")}
                                >
                                    Sentence Mode
                                </button>
                                <button
                                    onClick={() => { setSelectionMode('word'); setSelectedSentence(null); }}
                                    className={clsx("text-xs px-2 py-0.5 rounded transition-colors", selectionMode === 'word' ? "bg-white/20 text-white" : "text-slate-500 hover:text-slate-300")}
                                >
                                    Word Mode
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {modelLoading && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                                <Loader2 size={14} className="animate-spin" />
                                {modelProgress ? `Loading AI: ${Math.round(modelProgress.progress || 0)}%` : "Loading AI..."}
                            </div>
                        )}
                        <button
                            onClick={handleTogglePlay}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            {isPlaying ? "Pause" : "Listen"}
                        </button>

                        <button
                            onClick={() => setXRayMode(!xRayMode)}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                                xRayMode
                                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                            )}
                        >
                            {xRayMode ? <Eye size={16} /> : <EyeOff size={16} />}
                            X-Ray Mode
                        </button>
                    </div>
                </div>

                {/* X-Ray Legend */}
                <AnimatePresence>
                    {xRayMode && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 flex flex-wrap gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs"
                        >
                            <span className="flex items-center gap-1.5 text-blue-300"><span className="w-2 h-2 rounded-full bg-blue-400"></span>Subject</span>
                            <span className="flex items-center gap-1.5 text-red-300"><span className="w-2 h-2 rounded-full bg-red-400"></span>Verb</span>
                            <span className="flex items-center gap-1.5 text-emerald-300"><span className="w-2 h-2 rounded-full bg-emerald-400"></span>Object/Place</span>
                            <span className="flex items-center gap-1.5 text-amber-300"><span className="w-2 h-2 rounded-full bg-amber-400"></span>Adj/Adv</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={clsx("max-w-3xl mx-auto", isChat ? "space-y-6 px-2" : "px-8 py-4 leading-loose text-lg")}>
                    {content.content.map((item) => (
                        <div
                            key={item.id}
                            ref={activeSegmentId === item.id ? activeRef : null}
                            onClick={() => {
                                if (selectionMode === 'sentence') {
                                    setSelectedSentence(item);
                                    setSegment(item.id);
                                    if (!isPlaying) play();
                                }
                            }}
                            className={clsx(
                                "relative transition-all duration-300 rounded-xl border border-transparent",
                                isChat ? "p-4" : "inline",
                                selectionMode === 'sentence' && (selectedSentence?.id === item.id || activeSegmentId === item.id)
                                    ? "bg-white/10 border-emerald-500/30 shadow-lg"
                                    : selectionMode === 'sentence' ? "hover:bg-white/5 hover:border-white/10 cursor-pointer" : "",
                                isChat && item.speaker !== 'Narrator' ? "w-fit max-w-[85%]" : "w-full",
                                isChat && item.speaker === 'Me' ? "ml-auto bg-emerald-900/20" : "",
                                isChat && item.speaker !== 'Me' && item.speaker !== 'Narrator' ? "mr-auto bg-slate-800/40" : ""
                            )}
                        >
                            {isChat && item.speaker && item.speaker !== 'Narrator' && (
                                <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">
                                    {item.speaker}
                                </div>
                            )}

                            {selectionMode === 'word' ? (
                                <div className={clsx("text-lg leading-relaxed", isChat ? "" : "inline")}>
                                    {item.sentence.split(/([ .,;?!]+)/).filter(Boolean).map((token, idx) => {
                                        const isWord = /^\w+$/.test(token);
                                        if (!isWord) return <span key={idx}>{token}</span>;
                                        return (
                                            <span
                                                key={idx}
                                                onClick={(e) => handleWordClick(token, e)}
                                                className={clsx(
                                                    "cursor-pointer hover:text-emerald-400 hover:underline decoration-emerald-500/50 underline-offset-4 transition-colors",
                                                    selectedWord?.word === token ? "text-emerald-400 font-bold" : "text-slate-200"
                                                )}
                                            >
                                                {token}
                                            </span>
                                        );
                                    })}
                                </div>
                            ) : (
                                xRayMode && item.grammarAnalysis ? (
                                    <div className={clsx("text-lg leading-relaxed", isChat ? "" : "inline")}>
                                        {item.grammarAnalysis.map((seg, idx) => (
                                            <span
                                                key={idx}
                                                className={clsx(
                                                    "mx-0.5 px-1 rounded",
                                                    seg.color === 'blue' && "bg-blue-500/20 text-blue-200 box-decoration-clone",
                                                    seg.color === 'red' && "bg-red-500/20 text-red-200",
                                                    seg.color === 'green' && "bg-emerald-500/20 text-emerald-200",
                                                    seg.color === 'yellow' && "bg-amber-500/20 text-amber-200",
                                                    seg.color === 'gray' && "text-slate-300"
                                                )}
                                            >
                                                {seg.segment}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className={clsx("text-lg leading-relaxed", (selectedSentence?.id === item.id || activeSegmentId === item.id) ? "text-white" : "text-slate-200")}>
                                        {item.sentence}
                                    </span>
                                )
                            )}
                        </div>
                    ))}

                    {/* Finish Button */}
                    <div className="mt-12 mb-8 flex justify-center">
                        <button
                            onClick={() => {
                                useProgressStore.getState().addXP(50);
                                alert("Story Completed! +50 XP");
                            }}
                            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <Check size={24} />
                            Finish Story (+50 XP)
                        </button>
                    </div>
                </div>
            </div>

            {/* Smart Analysis Panel (Side) */}
            <AnimatePresence mode="wait">
                {selectedWord ? (
                    <motion.div
                        key="word-panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-full lg:w-[400px] glass-panel rounded-2xl p-6 overflow-y-auto border-l border-white/10"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <BookOpen size={20} className="text-emerald-400" />
                                Word Lookup
                            </h3>
                            <button
                                onClick={() => setSelectedWord(null)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                                <h2 className="text-3xl font-bold text-white mb-2">{selectedWord.word}</h2>
                                <div className="text-xl text-emerald-400 min-h-[2rem] flex items-center justify-center">
                                    {modelLoading && modelProgress ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2 text-sm text-emerald-300">
                                                <Loader2 className="animate-spin w-4 h-4" />
                                                <span>
                                                    {modelProgress.status === 'progress'
                                                        ? `Downloading model... ${Math.round(modelProgress.progress || 0)}%`
                                                        : 'Initializing AI...'}
                                                </span>
                                            </div>
                                            {modelProgress.file && (
                                                <span className="text-xs text-slate-500 max-w-[200px] truncate">
                                                    {modelProgress.file}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        selectedWord.translation
                                    )}
                                </div>
                                {selectedWord.grammarTip && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <span className="px-2 py-1 rounded bg-white/10 text-xs text-slate-400">
                                            {selectedWord.grammarTip}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : selectedSentence ? (
                    <motion.div
                        key="sentence-panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-full lg:w-[400px] glass-panel rounded-2xl p-6 overflow-y-auto border-l border-white/10"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Info size={20} className="text-emerald-400" />
                                Smart Analysis
                            </h3>
                            <button
                                onClick={() => setSelectedSentence(null)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Selected Sentence & Translation */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-lg font-medium text-white mb-2">{selectedSentence.sentence}</p>
                                <p className="text-slate-400 italic">{selectedSentence.translation}</p>
                            </div>

                            {/* Construction Note */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Construction</h4>
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-100">
                                    <p>{selectedSentence.smartLesson.construction}</p>
                                    {selectedSentence.smartLesson.constructionNote && (
                                        <p className="mt-3 pt-3 border-t border-blue-400/20 text-sm text-blue-200/80 italic">
                                            "{selectedSentence.smartLesson.constructionNote}"
                                        </p>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-2 ml-1">
                                    {selectedSentence.formationNote}
                                </p>
                            </div>

                            {/* Situation Note */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Situation & Context</h4>
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-100">
                                    <p>{selectedSentence.smartLesson.situation}</p>
                                </div>
                            </div>

                            {/* Grammar Tags */}
                            {selectedSentence.grammarTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                                    {selectedSentence.grammarTags.map((tag, i) => (
                                        <span key={i} className="px-2 py-1 rounded-md bg-white/5 text-xs text-slate-400 border border-white/10">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <div className="hidden lg:flex w-[400px] items-center justify-center text-slate-500 glass-panel rounded-2xl border-l border-white/10">
                        <div className="text-center p-6">
                            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Select a {selectionMode} to view<br />{selectionMode === 'word' ? 'Definition' : 'Smart Analysis'}</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReadingLounge;
