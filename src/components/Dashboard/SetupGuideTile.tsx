import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SetupGuideTile: React.FC = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden group cursor-pointer"
            onClick={() => navigate('/guide')}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <HelpCircle size={80} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <HelpCircle size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white">New Here?</h3>
                </div>

                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                    Get the most out of LangApp! Learn how to set up AI, import content, and master the smart features.
                </p>

                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all">
                    View Setup Guide <ArrowRight size={14} />
                </div>
            </div>
        </motion.div>
    );
};

export default SetupGuideTile;
