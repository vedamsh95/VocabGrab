import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, BookOpen, Zap, LayoutGrid, Pilcrow, ChevronLeft, ChevronRight, Settings, Check } from 'lucide-react';

const QuickActionsCarousel: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [selectedActions, setSelectedActions] = useState<string[]>([]);

    // All available actions
    const allActions = [
        { id: 'ai', icon: <Sparkles size={24} className="text-purple-400" />, label: 'AI Gen', bg: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20', action: () => navigate('/import?mode=ai') },
        { id: 'import', icon: <Upload size={24} className="text-emerald-400" />, label: 'Import Set', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20', action: () => navigate('/import?mode=json') },
        { id: 'vocab', icon: <BookOpen size={24} className="text-blue-400" />, label: 'Vocab', bg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20', action: () => navigate('/vocab') },
        { id: 'practice', icon: <Zap size={24} className="text-yellow-400" />, label: 'Practice', bg: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20', action: () => navigate('/practice') },
        { id: 'reading', icon: <BookOpen size={24} className="text-orange-400" />, label: 'Reading', bg: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20', action: () => navigate('/reading') },
        { id: 'grammar', icon: <Pilcrow size={24} className="text-pink-400" />, label: 'Grammar', bg: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20', action: () => navigate('/grammar') },
        { id: 'library', icon: <LayoutGrid size={24} className="text-cyan-400" />, label: 'Library', bg: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20', action: () => navigate('/library') }
    ];

    // Load preferences
    useEffect(() => {
        const saved = localStorage.getItem('quick_actions_pref');
        if (saved) {
            setSelectedActions(JSON.parse(saved));
        } else {
            // Default selection
            setSelectedActions(['ai', 'import', 'vocab', 'practice', 'reading', 'grammar', 'library']);
        }
    }, []);

    const savePreferences = () => {
        localStorage.setItem('quick_actions_pref', JSON.stringify(selectedActions));
        setIsCustomizing(false);
        setCurrentPage(0); // Reset to first page
    };

    const toggleAction = (id: string) => {
        if (selectedActions.includes(id)) {
            setSelectedActions(prev => prev.filter(a => a !== id));
        } else {
            if (selectedActions.length >= 8) {
                alert("You can select up to 8 actions.");
                return;
            }
            setSelectedActions(prev => [...prev, id]);
        }
    };

    // Filter actions based on selection
    const activeActions = allActions.filter(a => selectedActions.includes(a.id));

    // Chunk into pages of 2
    const pages = [];
    for (let i = 0; i < activeActions.length; i += 2) {
        pages.push(activeActions.slice(i, i + 2));
    }

    const nextPage = () => setCurrentPage((prev) => (prev + 1) % pages.length);
    const prevPage = () => setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length);

    return (
        <div className="glass-card p-1 relative h-full flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" />
                    Quick Actions
                </h3>
                <div className="flex items-center gap-2">
                    {!isCustomizing && (
                        <>
                            <button onClick={prevPage} className="p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-white/5">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={nextPage} className="p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-white/5">
                                <ChevronRight size={16} />
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setIsCustomizing(!isCustomizing)}
                        className={`p-1 transition-colors rounded hover:bg-white/5 ${isCustomizing ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                        title="Customize"
                    >
                        <Settings size={16} />
                    </button>
                </div>
            </div>

            <div className="p-6 flex-1 relative">
                <AnimatePresence mode="wait">
                    {isCustomizing ? (
                        <motion.div
                            key="customizing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 p-4 bg-slate-900/90 backdrop-blur-md z-10 overflow-y-auto rounded-b-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-white font-bold text-sm">Select Actions</h4>
                                <button onClick={savePreferences} className="text-xs bg-emerald-500 text-white px-2 py-1 rounded font-bold">Done</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {allActions.map(action => (
                                    <button
                                        key={action.id}
                                        onClick={() => toggleAction(action.id)}
                                        className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${selectedActions.includes(action.id)
                                            ? 'bg-emerald-500/20 border-emerald-500 text-white'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {selectedActions.includes(action.id) && <Check size={12} className="text-emerald-400" />}
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-2 gap-3 h-full"
                        >
                            {pages.length > 0 ? (
                                pages[currentPage].map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={action.action}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl ${action.bg} border transition-all group h-full`}
                                    >
                                        <div className="mb-2 group-hover:scale-110 transition-transform">
                                            {action.icon}
                                        </div>
                                        <span className="text-xs font-bold text-white">{action.label}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-2 flex items-center justify-center text-slate-400 text-xs">
                                    No actions selected.
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Page Indicators */}
                {!isCustomizing && pages.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-4 absolute bottom-4 left-0 right-0">
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
                )}
            </div>
        </div>
    );
};

export default QuickActionsCarousel;
