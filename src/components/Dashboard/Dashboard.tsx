import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Trophy, Upload, Play, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { getActiveSet } from '../../lib/storage';

import Logo from '../../assets/Logo.png';

const Dashboard: React.FC = () => {
    const activeSet = getActiveSet();

    // Mock data for heatmap
    const days = Array.from({ length: 28 }, () => ({
        level: Math.random() > 0.7 ? 2 : Math.random() > 0.4 ? 1 : 0
    }));

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex items-center gap-4">
                <img src={Logo} alt="VocabGrab Logo" className="w-16 h-16 object-contain drop-shadow-lg" />
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                        Welcome back, <span className="text-gradient">Learner</span>
                    </h1>
                    <p className="text-slate-400">Ready to continue your streak?</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[180px]">

                {/* Bento Box 1: Daily Progress (Large) */}
                <motion.div
                    className="glass-card p-6 md:col-span-2 md:row-span-2 flex flex-col justify-between relative overflow-hidden group"
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="flex justify-between items-start z-10">
                        <div>
                            <h3 className="text-xl text-white font-semibold mb-1">Daily Activity</h3>
                            <p className="text-slate-400 text-sm">You're on fire! 🔥</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                            <Calendar className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-8 flex-wrap z-10">
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`w-8 h-8 rounded-lg transition-colors duration-500 ${day.level === 2 ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' :
                                    day.level === 1 ? 'bg-emerald-500/40' :
                                        'bg-white/5'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="mt-8">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300">Daily Goal</span>
                            <span className="text-white font-bold">85%</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                initial={{ width: 0 }}
                                animate={{ width: '85%' }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Bento Box 2: Current Deck (3D Tilt) */}
                <motion.div
                    className="glass-card p-6 md:col-span-2 relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-black z-0" />
                    <div className="relative z-10 flex justify-between items-center h-full">
                        <div>
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 block">Current Deck</span>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {activeSet ? activeSet.targetLanguage : "No Set"}
                            </h2>
                            <p className="text-slate-400 text-sm mb-4">
                                {activeSet ? activeSet.title : "Import a set to begin"}
                            </p>
                            {activeSet ? (
                                <Link to="/flashcards" className="btn-primary px-6 py-2 inline-flex items-center gap-2 text-sm">
                                    <Play className="w-4 h-4 fill-current" />
                                    Resume
                                </Link>
                            ) : (
                                <Link to="/import" className="btn-primary px-6 py-2 inline-flex items-center gap-2 text-sm">
                                    <Upload className="w-4 h-4" />
                                    Import
                                </Link>
                            )}
                        </div>
                        {/* Decorative 3D Element */}
                        <div className="hidden md:block w-32 h-40 bg-gradient-to-br from-slate-800 to-black border border-white/10 rounded-xl transform rotate-12 shadow-2xl opacity-80 group-hover:rotate-6 transition-transform duration-500" />
                    </div>
                </motion.div>

                {/* Bento Box 3: Quick Import & Guide */}
                <div className="flex flex-col gap-6 h-full">
                    <Link to="/import" className="group flex-1">
                        <motion.div
                            className="glass-card p-6 h-full flex flex-col items-center justify-center text-center relative overflow-hidden"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                                <Upload className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h3 className="text-white font-semibold text-sm">Import JSON</h3>
                        </motion.div>
                    </Link>

                    <Link to="/guide" className="group flex-1">
                        <motion.div
                            className="glass-card p-6 h-full flex flex-col items-center justify-center text-center relative overflow-hidden"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/10 group-hover:border-blue-500/50 transition-colors">
                                <Trophy className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-white font-semibold text-sm">Setup Guide</h3>
                        </motion.div>
                    </Link>
                </div>

                {/* Bento Box 4: Streak */}
                <motion.div
                    className="glass-card p-6 h-full flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                >
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                        <Flame className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">12</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Day Streak</div>
                    </div>
                </motion.div>

                {/* Bento Box 5: Words Learned */}
                <motion.div
                    className="glass-card p-6 h-full flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                >
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                        <Trophy className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">
                            {activeSet ? activeSet.vocabulary.length : 0}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Words Learned</div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default Dashboard;
