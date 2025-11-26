import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Plus, ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StudySet } from '../../types/schema';
import { setActiveSetId } from '../../lib/storage';

interface LibraryTileProps {
    sets: StudySet[];
}

const LibraryTile: React.FC<LibraryTileProps> = ({ sets }) => {
    const navigate = useNavigate();

    // Sort by creation date (newest first)
    const recentSets = [...sets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 2);

    // Sort by last used (most recent first)
    const lastUsedSets = [...sets]
        .filter(s => s.lastUsed)
        .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
        .slice(0, 2);

    const handleSetClick = (id: string) => {
        setActiveSetId(id);
        navigate('/practice');
    };

    return (
        <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <BookOpen size={20} className="text-cyan-400" />
                    Library Highlights
                </h3>
                <button
                    onClick={() => navigate('/library')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                    View All <ArrowRight size={12} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Jump Back In */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                        <Clock size={12} /> Jump Back In
                    </h4>
                    <div className="space-y-3">
                        {lastUsedSets.length > 0 ? (
                            lastUsedSets.map(set => (
                                <motion.div
                                    key={set.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => handleSetClick(set.id)}
                                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 cursor-pointer transition-all group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h5 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">{set.title}</h5>
                                            <p className="text-[10px] text-slate-400">{set.targetLanguage} • {set.vocabulary.length} words</p>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play size={10} fill="currentColor" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-slate-500 text-xs italic">
                                No recently studied sets.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recently Added */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                        <Plus size={12} /> Recently Added
                    </h4>
                    <div className="space-y-3">
                        {recentSets.length > 0 ? (
                            recentSets.map(set => (
                                <motion.div
                                    key={set.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => handleSetClick(set.id)}
                                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h5 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{set.title}</h5>
                                            <p className="text-[10px] text-slate-400">{set.targetLanguage} • {new Date(set.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight size={12} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-slate-500 text-xs italic">
                                No sets added yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LibraryTile;
