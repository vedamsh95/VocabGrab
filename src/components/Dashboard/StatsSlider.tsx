import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProgressStore } from '../../store/useProgressStore';

const StatsSlider: React.FC = () => {
    const { streak, learnedWords, xp, getWeeklyActivity } = useProgressStore();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-play
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % 3);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + 3) % 3);

    const weeklyActivity = getWeeklyActivity();
    const maxActivity = Math.max(...weeklyActivity, 10);

    const slides = [
        {
            id: 'streak',
            icon: <Flame size={24} className="text-orange-400" />,
            bg: 'bg-orange-500/10 border-orange-500/20',
            label: 'Current Streak',
            value: `${streak.count} Days`,
            subValue: 'Keep it up!',
            color: 'text-orange-400'
        },
        {
            id: 'xp',
            icon: <Zap size={24} className="text-yellow-400" />,
            bg: 'bg-yellow-500/10 border-yellow-500/20',
            label: 'Weekly XP',
            value: xp.total,
            subValue: 'Points earned',
            color: 'text-yellow-400',
            chart: (
                <div className="flex items-end gap-1 h-8 mt-1">
                    {weeklyActivity.map((val, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-yellow-400/30 rounded-sm"
                            style={{ height: `${(val / maxActivity) * 100}%` }}
                        />
                    ))}
                </div>
            )
        },
        {
            id: 'words',
            icon: <BookOpen size={24} className="text-emerald-400" />,
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            label: 'Words Learned',
            value: learnedWords,
            subValue: 'Total words',
            color: 'text-emerald-400'
        }
    ];

    return (
        <div className="glass-card relative overflow-hidden rounded-2xl h-full min-h-[160px] flex flex-col">
            <div className="absolute top-2 right-2 flex gap-1 z-10">
                <button onClick={prevSlide} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft size={16} />
                </button>
                <button onClick={nextSlide} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ChevronRight size={16} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-1 p-6 flex flex-col justify-center ${slides[currentIndex].bg} border-b-4 ${slides[currentIndex].color.replace('text', 'border')}`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-white/10 ${slides[currentIndex].color}`}>
                            {slides[currentIndex].icon}
                        </div>
                        <span className="text-slate-300 text-sm font-medium">{slides[currentIndex].label}</span>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-3xl font-black text-white">{slides[currentIndex].value}</h3>
                            <p className="text-slate-400 text-xs mt-1">{slides[currentIndex].subValue}</p>
                        </div>
                        {slides[currentIndex].chart}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-1.5 py-3 bg-black/20">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/20'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default StatsSlider;
