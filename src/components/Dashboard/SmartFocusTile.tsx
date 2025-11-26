import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StudySet } from '../../types/schema';
import { setActiveSetId } from '../../lib/storage';

interface SmartFocusTileProps {
    activeSet: StudySet | null;
    allSets: StudySet[];
}

const SmartFocusTile: React.FC<SmartFocusTileProps> = ({ activeSet, allSets }) => {
    const navigate = useNavigate();

    // Determine the smartest action
    const getSmartRecommendation = () => {
        if (!activeSet) {
            // Case 0: No active set
            if (allSets.length > 0) {
                // Recommend the most recently created set
                const newest = [...allSets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                return {
                    type: 'start',
                    title: "Start Learning",
                    subtitle: `Dive into "${newest.title}"`,
                    icon: <Sparkles size={20} className="text-purple-400" />,
                    action: () => { setActiveSetId(newest.id); navigate('/practice'); },
                    color: 'purple'
                };
            } else {
                // No sets at all
                return {
                    type: 'create',
                    title: "Create Your First Set",
                    subtitle: "Import or generate content to begin",
                    icon: <Sparkles size={20} className="text-emerald-400" />,
                    action: () => navigate('/import'),
                    color: 'emerald'
                };
            }
        }

        // Case 1: Active set hasn't been touched in > 3 days
        const lastUsed = activeSet.lastUsed ? new Date(activeSet.lastUsed) : new Date(activeSet.createdAt);
        const daysSince = (new Date().getTime() - lastUsed.getTime()) / (1000 * 3600 * 24);

        if (daysSince > 3) {
            return {
                type: 'review',
                title: "Time to Review",
                subtitle: `It's been ${Math.floor(daysSince)} days. Keep the memory fresh!`,
                icon: <Clock size={20} className="text-orange-400" />,
                action: () => navigate('/practice'),
                color: 'orange'
            };
        }

        // Case 2: Low completion rate (simple heuristic: < 50% words learned in this set)
        // Note: We don't track per-set learned words strictly in store yet, so we use a proxy or generic message
        // For now, we'll assume "Continue Learning" is the default safe bet
        return {
            type: 'continue',
            title: "Continue Learning",
            subtitle: `Master "${activeSet.title}"`,
            icon: <Zap size={20} className="text-yellow-400" />,
            action: () => navigate('/practice'),
            color: 'yellow'
        };
    };

    const recommendation = getSmartRecommendation();

    const colorClasses = {
        purple: 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/30',
        emerald: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30',
        orange: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30',
        yellow: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden group"
        >
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-10 bg-${recommendation.color}-500 pointer-events-none`} />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <Target size={20} className={`text-${recommendation.color}-400`} />
                    Smart Focus
                </h3>
                <div className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                    AI Recommended
                </div>
            </div>

            <div className="relative z-10">
                <h4 className="text-2xl font-bold text-white mb-1">{recommendation.title}</h4>
                <p className="text-slate-400 text-sm mb-6">{recommendation.subtitle}</p>

                <button
                    onClick={recommendation.action}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${colorClasses[recommendation.color as keyof typeof colorClasses]}`}
                >
                    {recommendation.icon}
                    Let's Go
                    <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
};

export default SmartFocusTile;
