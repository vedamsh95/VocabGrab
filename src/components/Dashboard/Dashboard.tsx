import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Trophy, BookOpen, Play, ArrowRight, Zap, LayoutGrid, Upload, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getActiveSet, getAllSets } from '../../lib/storage';
import type { StudySet } from '../../types/schema';
import { useProgressStore } from '../../store/useProgressStore';

// Floating Letters Component (Background)
const FloatingLetters = () => {
    const characters = ['A', 'あ', '文', 'Ñ', 'ç', 'ẞ', '你', 'Ω', 'Ж', 'த', 'é', 'ü', 'å', 'ø', '☕', '🚀', '⭐'];
    const colors = ['text-emerald-500/10', 'text-blue-500/10', 'text-purple-500/10', 'text-orange-500/10', 'text-pink-500/10'];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute font-bold text-2xl md:text-4xl ${colors[Math.floor(Math.random() * colors.length)]}`}
                    initial={{
                        x: Math.random() * 100 + '%',
                        y: Math.random() * 100 + '%',
                        opacity: 0,
                        scale: 0.5,
                        rotate: Math.random() * 360
                    }}
                    animate={{
                        y: [null, Math.random() * -100],
                        opacity: [0, 0.8, 0],
                        rotate: [null, Math.random() * 360]
                    }}
                    transition={{
                        duration: Math.random() * 20 + 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 10
                    }}
                >
                    {characters[Math.floor(Math.random() * characters.length)]}
                </motion.div>
            ))}
        </div>
    );
};

// Cursor Follower Component
const CursorLetters = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const characters = ['A', 'あ', '文', 'Ñ', 'Ω'];

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {characters.map((char, i) => (
                <motion.div
                    key={i}
                    className="absolute text-emerald-500/20 font-bold text-xl"
                    animate={{
                        x: mousePos.x + Math.cos(Date.now() / 1000 + i) * 50,
                        y: mousePos.y + Math.sin(Date.now() / 1000 + i) * 50,
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        type: "spring",
                        damping: 10,
                        stiffness: 50,
                        opacity: { duration: 2, repeat: Infinity }
                    }}
                >
                    {char}
                </motion.div>
            ))}
        </div>
    );
};

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const activeSet = getActiveSet();
    const [sets, setSets] = useState<StudySet[]>([]);
    const { streak, learnedWords, xp, getWeeklyActivity } = useProgressStore();

    useEffect(() => {
        setSets(getAllSets());
    }, []);

    // Sort sets by creation date (newest first)
    const recentSets = [...sets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const mostRecent = recentSets.length > 0 ? recentSets[0] : null;

    // Weekly Activity Data for Mini Chart
    const weeklyActivity = getWeeklyActivity();
    const maxActivity = Math.max(...weeklyActivity, 10); // Avoid divide by zero

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 relative">
            <CursorLetters />

            {/* 1. HERO SECTION */}
            <section className="relative rounded-3xl overflow-hidden glass-card min-h-[350px] flex items-center justify-center text-center p-8 border border-white/10 shadow-2xl group">
                <FloatingLetters />

                <div className="relative z-10 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                            Stuck in a preset app? <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Here, you learn YOUR way.
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-lg md:text-xl text-slate-300 mb-8"
                    >
                        Want to master a specific topic today? Boom, you can.
                        Need a custom study path? Boom, it's yours.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <button
                            onClick={() => navigate('/import?mode=json')}
                            className="btn-primary px-8 py-3 text-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20 bg-slate-700 hover:bg-slate-600 border-slate-600"
                        >
                            <Upload size={20} />
                            Import Your Set
                        </button>
                        <button
                            onClick={() => navigate('/import?mode=ai')}
                            className="btn-primary px-8 py-3 text-lg flex items-center gap-2 shadow-lg shadow-purple-500/20 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-none"
                        >
                            <Sparkles size={20} />
                            AI Generated
                        </button>
                    </motion.div>
                </div>

                {/* Background Gradient Mesh */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black/60 z-0" />
            </section>

            {/* 2. STATS ROW */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Streak Tile */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 flex flex-col justify-between h-40 relative overflow-hidden group"
                >
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Flame size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
                            <Flame size={24} fill="currentColor" />
                        </div>
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-xs">Day Streak</span>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-white">{streak.count}</div>
                        <div className="text-sm text-slate-400 mt-1">Keep the fire burning!</div>
                    </div>
                </motion.div>

                {/* XP & Activity Tile */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 flex flex-col justify-between h-40 relative overflow-hidden group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <span className="text-slate-400 font-medium uppercase tracking-wider text-xs">Total XP</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{xp.total}</div>
                    </div>

                    {/* Mini Bar Chart */}
                    <div className="flex items-end justify-between h-16 gap-1">
                        {weeklyActivity.map((val, i) => (
                            <div key={i} className="w-full bg-white/5 rounded-t-sm relative group/bar">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(val / maxActivity) * 100}%` }}
                                    className="absolute bottom-0 w-full bg-emerald-500/50 rounded-t-sm group-hover/bar:bg-emerald-400 transition-colors"
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Words Learned Tile */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 flex flex-col justify-between h-40 relative overflow-hidden group"
                >
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BookOpen size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                            <Trophy size={24} fill="currentColor" />
                        </div>
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-xs">Words Learned</span>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-white">{learnedWords.length}</div>
                        <div className="text-sm text-slate-400 mt-1">Vocabulary growing strong</div>
                    </div>
                </motion.div>
            </section>


            {/* 3. LIBRARY / DECKS ROW */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Current Focus */}
                <div className="glass-card p-1">
                    <div className="p-5 border-b border-white/5">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <LayoutGrid size={18} className="text-emerald-400" />
                            Current Focus
                        </h3>
                    </div>
                    <div className="p-6">
                        {activeSet ? (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xl font-bold text-white">{activeSet.title}</h4>
                                    <p className="text-slate-400 text-sm">{activeSet.targetLanguage} • {activeSet.vocabulary.length} words</p>
                                </div>
                                <Link
                                    to="/practice"
                                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                                >
                                    <Play size={18} fill="currentColor" />
                                    Continue Learning
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-slate-400">
                                <p className="mb-4">No active set selected.</p>
                                <Link to="/library" className="text-emerald-400 hover:underline">Go to Library</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recently Added */}
                <div className="glass-card p-1">
                    <div className="p-5 border-b border-white/5">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <BookOpen size={18} className="text-blue-400" />
                            Recently Added
                        </h3>
                    </div>
                    <div className="p-6">
                        {mostRecent ? (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xl font-bold text-white">{mostRecent.title}</h4>
                                    <p className="text-slate-400 text-sm">Added {new Date(mostRecent.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        // Logic to set active set could go here, or just navigate to library to select
                                        navigate('/library');
                                    }}
                                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    View in Library <ArrowRight size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-slate-400">
                                <p>No sets created yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Practice */}
                <div className="glass-card p-1">
                    <div className="p-5 border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <Zap size={18} className="text-yellow-400" />
                            Quick Actions
                        </h3>
                        <button className="text-xs text-slate-400 hover:text-white transition-colors">
                            Customize
                        </button>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-3">
                        <Link
                            to="/import?mode=ai"
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all group"
                        >
                            <Zap size={24} className="text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-purple-300">AI Gen</span>
                        </Link>
                        <Link
                            to="/import?mode=json"
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all group"
                        >
                            <Upload size={24} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-emerald-300">Import Set</span>
                        </Link>
                    </div>
                </div>

            </section>
        </div>
    );
};

export default Dashboard;
