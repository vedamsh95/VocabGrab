import { Sparkles, TrendingUp, Flame, BookOpen, Zap, Upload, Target, ChevronRight, ChevronLeft, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getAllSets, getActiveSet } from '../../lib/storage';
import { useNavigate } from 'react-router-dom';
import type { StudySet } from '../../types/schema';
import { useProgressStore } from '../../store/useProgressStore';
import Logo from '../Common/Logo';

// Floating Letters Component (Background)
const FloatingLetters = () => {
    const characters = [
        // Latin Extended
        'A', 'Ñ', 'ç', 'ẞ', 'é', 'ü', 'å', 'ø',
        // Japanese
        'あ', 'か', 'さ', 'ひ', 'ん',
        // Chinese
        '文', '你', '好', '学', '书',
        // Korean
        '한', '글', '가', '나',
        // Arabic
        'ا', 'ب', 'ت', 'ث',
        // Hindi/Devanagari
        'अ', 'आ', 'क', 'ख',
        // Russian/Cyrillic
        'Ж', 'Д', 'Я', 'Ф',
        // Greek
        'Ω', 'Σ', 'Δ', 'Φ',
        // Hebrew
        'א', 'ב', 'ג',
        // Thai
        'ก', 'ข', 'ค',
        // Tamil
        'த', 'ம', 'ன',
        // Symbols
        '☕', '🚀', '⭐', '📚', '✨'
    ];
    const colors = ['text-emerald-500/10', 'text-blue-500/10', 'text-purple-500/10', 'text-orange-500/10', 'text-pink-500/10'];

    // Generate random positions once to ensure proper distribution
    const [positions] = useState(() =>
        Array.from({ length: 50 }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            char: characters[Math.floor(Math.random() * characters.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            duration: Math.random() * 20 + 10,
            delay: Math.random() * 10
        }))
    );

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {positions.map((pos, i) => (
                <motion.div
                    key={i}
                    className={`absolute font-bold text-2xl md:text-4xl ${pos.color}`}
                    style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`
                    }}
                    initial={{
                        opacity: 0,
                        scale: 0.5,
                        rotate: Math.random() * 360
                    }}
                    animate={{
                        y: [0, -100, -200],
                        opacity: [0, 0.8, 0],
                        rotate: [null as any, Math.random() * 360]
                    }}
                    transition={{
                        duration: pos.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: pos.delay
                    }}
                >
                    {pos.char}
                </motion.div>
            ))}
        </div>
    );
};

// Cursor Follower Component
const CursorLetters = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    // VocabGrab in multiple scripts: Telugu, Cyrillic, Japanese, Korean, Greek, Chinese
    const characters = ['వో', 'с', 'а', 'ぼ', '고', 'я', 'ά', '本'];

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

// Quick Actions Carousel Component
const QuickActionsCarousel: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0);

    const pages = [
        // Page 1: Create & Import
        [
            {
                icon: <Sparkles size={24} className="text-purple-400" />,
                label: 'AI Gen',
                bg: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20',
                action: () => navigate('/import?mode=ai')
            },
            {
                icon: <Upload size={24} className="text-emerald-400" />,
                label: 'Import Set',
                bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20',
                action: () => navigate('/import?mode=json')
            }
        ],
        // Page 2: Practice
        [
            {
                icon: <BookOpen size={24} className="text-blue-400" />,
                label: 'Vocab',
                bg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20',
                action: () => navigate('/vocab')
            },
            {
                icon: <Zap size={24} className="text-yellow-400" />,
                label: 'Practice',
                bg: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20',
                action: () => navigate('/practice')
            }
        ],
        // Page 3: Content (Reading & Grammar)
        [
            {
                icon: <BookOpen size={24} className="text-orange-400" />,
                label: 'Reading',
                bg: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20',
                action: () => navigate('/reading')
            },
            {
                icon: <LayoutGrid size={24} className="text-pink-400" />, // Changed icon/color
                label: 'Grammar',
                bg: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20',
                action: () => navigate('/grammar')
            }
        ],
        // Page 4: Library
        [
            {
                icon: <LayoutGrid size={24} className="text-cyan-400" />,
                label: 'Library',
                bg: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20',
                action: () => navigate('/library')
            }
        ]
    ];

    const nextPage = () => {
        setCurrentPage((prev) => (prev + 1) % pages.length);
    };

    const prevPage = () => {
        setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length);
    };

    return (
        <div className="glass-card p-1 relative">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" />
                    Quick Actions
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevPage}
                        className="p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-white/5"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={nextPage}
                        className="p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-white/5"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
            <div className="p-6">
                <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 gap-3"
                >
                    {pages[currentPage].map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.action}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl ${action.bg} border transition-all group`}
                        >
                            <div className="mb-2 group-hover:scale-110 transition-transform">
                                {action.icon}
                            </div>
                            <span className="text-xs font-bold text-white">{action.label}</span>
                        </button>
                    ))}
                </motion.div>
                {/* Page Indicators */}
                <div className="flex justify-center gap-1.5 mt-4">
                    {pages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPage(idx)}
                            className={`h-1.5 rounded-full transition-all ${idx === currentPage
                                ? 'w-6 bg-emerald-400'
                                : 'w-1.5 bg-white/20 hover:bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            </div>
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

            {/* Logo - Top Right Corner (less obstructive) */}
            <div className="absolute top-6 right-6 z-50 opacity-60 hover:opacity-100 transition-opacity">
                <Logo size="large" />
            </div>

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
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Your Rules, Your Learning.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                            You decide what you learn, how you practice, and when you succeed. No forced drills. No rigid paths. Just pure, customizable mastery.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/import?mode=json')}
                                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
                            >
                                <Upload size={24} />
                                Import Your Content
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/import?mode=ai')}
                                className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2"
                            >
                                <Sparkles size={24} />
                                Generate with AI
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. STATS SECTION */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Streak */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-orange-500/20 shadow-lg shadow-orange-500/10"
                >
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                        <Flame size={32} className="text-orange-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Current Streak</p>
                        <p className="text-3xl font-black text-white flex items-center gap-2">
                            {streak.count} <Flame size={20} className="text-orange-400" />
                        </p>
                    </div>
                </motion.div>

                {/* XP */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-yellow-500/20 shadow-lg shadow-yellow-500/10"
                >
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                        <Zap size={32} className="text-yellow-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-slate-400 text-sm">Weekly XP</p>
                        <p className="text-3xl font-black text-white">{xp.total}</p>
                        {/* Mini Activity Chart */}
                        <div className="flex items-end gap-1 mt-2">
                            {weeklyActivity.map((val, i) => (
                                <motion.div
                                    key={i}
                                    className="flex-1 bg-yellow-400/30 rounded-sm"
                                    style={{ height: `${(val / maxActivity) * 24}px` }}
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Words Learned */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                >
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <BookOpen size={32} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Words Learned</p>
                        <p className="text-3xl font-black text-white flex items-center gap-2">
                            {learnedWords} <TrendingUp size={20} className="text-emerald-400" />
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* 3. CURRENT FOCUS & QUICK ACTIONS */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Focus */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6 rounded-2xl border border-white/10 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <Target size={20} className="text-emerald-400" />
                            Current Focus
                        </h3>
                        <LayoutGrid size={18} className="text-slate-400" />
                    </div>
                    {activeSet ? (
                        <div>
                            <h4 className="text-xl font-bold text-white mb-2">{activeSet.title}</h4>
                            <p className="text-slate-400 text-sm mb-4">{activeSet.targetLanguage || 'Unknown Language'} • {activeSet.difficulty || 'Unknown Difficulty'}</p>
                            <button
                                onClick={() => navigate('/practice')}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Zap size={20} />
                                Start Practice
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-slate-400 mb-4">No active set selected</p>
                            <button
                                onClick={() => navigate('/library')}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                            >
                                Browse Library
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <QuickActionsCarousel />
                </motion.div>
            </section>

            {/* 4. RECENTLY ADDED */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpen size={24} className="text-emerald-400" />
                        Recently Added
                    </h2>
                </div>
                {mostRecent ? (
                    <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-lg">
                        <h4 className="text-lg font-bold text-white mb-2">{mostRecent.title}</h4>
                        <p className="text-slate-400 text-sm mb-4">
                            {mostRecent.targetLanguage || 'Unknown Language'} • {mostRecent.difficulty || 'Unknown Difficulty'}
                        </p>
                        <p className="text-slate-300 text-sm">
                            {mostRecent.vocabulary ? `${mostRecent.vocabulary.length} words` : 'No vocabulary'}
                        </p>
                    </div>
                ) : (
                    <div className="glass-card p-8 rounded-2xl border border-white/10 text-center">
                        <p className="text-slate-400 mb-4">No study sets yet. Import content to get started!</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
