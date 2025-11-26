import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles } from 'lucide-react';
import { getAllSets, getActiveSet } from '../../lib/storage';
import type { StudySet } from '../../types/schema';
import Logo from '../Common/Logo';

// Components
import StatsSlider from './StatsSlider';
import QuickActionsCarousel from './QuickActionsCarousel';
import LibraryTile from './LibraryTile';
import SetupGuideTile from './SetupGuideTile';
import SmartFocusTile from './SmartFocusTile';


// Floating Letters Component (Background)
const FloatingLetters = () => {
    const characters = [
        'A', 'Ñ', 'ç', 'ẞ', 'é', 'ü', 'å', 'ø',
        'あ', 'か', 'さ', 'ひ', 'ん',
        '文', '你', '好', '学', '书',
        '한', '글', '가', '나',
        'ا', 'ب', 'ت', 'ث',
        'अ', 'आ', 'क', 'ख',
        'Ж', 'Д', 'Я', 'Ф',
        'Ω', 'Σ', 'Δ', 'Φ',
        'א', 'ב', 'ג',
        'ก', 'ข', 'ค',
        'த', 'ம', 'ன',
        '☕', '🚀', '⭐', '📚', '✨'
    ];
    const colors = ['text-emerald-500/10', 'text-blue-500/10', 'text-purple-500/10', 'text-orange-500/10', 'text-pink-500/10'];

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

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [sets, setSets] = useState<StudySet[]>([]);
    const [activeSet, setActiveSetState] = useState<StudySet | null>(null);

    const loadData = () => {
        setSets(getAllSets());
        setActiveSetState(getActiveSet());
    };

    useEffect(() => {
        loadData();
        const handleStorageUpdate = () => loadData();
        window.addEventListener('storage-update', handleStorageUpdate);
        return () => window.removeEventListener('storage-update', handleStorageUpdate);
    }, []);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 relative pb-24">
            <CursorLetters />

            {/* Logo - Top Right Corner */}
            <div className="absolute top-6 right-6 z-50 opacity-60 hover:opacity-100 transition-opacity">
                <Logo size="large" />
            </div>

            {/* 1. HERO SECTION */}
            <section className="relative rounded-3xl overflow-hidden glass-card min-h-[300px] flex items-center justify-center text-center p-8 border border-white/10 shadow-2xl group">
                <FloatingLetters />

                <div className="relative z-10 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                            Stuck in a preset app? <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Your Rules, Your Learning.</span>
                        </h1>
                        <p className="text-base md:text-lg text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                            You decide what you learn, how you practice, and when you succeed. No forced drills. Just pure mastery.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/import?mode=json')}
                                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
                            >
                                <Upload size={20} />
                                Import Content
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/import?mode=ai')}
                                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2"
                            >
                                <Sparkles size={20} />
                                Generate with AI
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Quick Actions */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <StatsSlider />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="h-[240px]"
                    >
                        <QuickActionsCarousel />
                    </motion.div>
                </div>

                {/* Middle & Right Column: Smart Focus & Library */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <SmartFocusTile activeSet={activeSet} allSets={sets} />
                        </div>
                        <div className="md:col-span-1">
                            <SetupGuideTile />
                        </div>
                    </div>



                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <LibraryTile sets={sets} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
