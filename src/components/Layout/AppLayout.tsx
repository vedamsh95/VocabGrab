import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Layers, PenTool, Home, Upload, Book, Pilcrow } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const DockItem: React.FC<{ to: string; icon: React.ReactNode; label: string; isActive: boolean }> = ({ to, icon, label, isActive }) => {
    return (
        <Link to={to} className="relative group flex flex-col items-center gap-1">
            <motion.div
                className={cn(
                    "p-3 rounded-2xl transition-all duration-300",
                    isActive ? "bg-white/10 text-emerald-400 shadow-lg shadow-emerald-500/10" : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
            >
                {icon}
            </motion.div>
            <span className={cn(
                "absolute -top-8 px-2 py-1 rounded-lg bg-black/80 text-xs text-white opacity-0 transition-opacity pointer-events-none border border-white/10 backdrop-blur-md",
                "group-hover:opacity-100"
            )}>
                {label}
            </span>
            {isActive && (
                <motion.div
                    layoutId="dock-dot"
                    className="absolute -bottom-2 w-1 h-1 rounded-full bg-emerald-500"
                />
            )}
        </Link>
    );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background text-slate-300 font-sans selection:bg-emerald-500/30">
            <div className="pb-24"> {/* Padding for dock */}
                {children}
            </div>

            {/* Floating Dock */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="glass-panel px-6 py-3 rounded-3xl flex items-center gap-4 shadow-2xl shadow-black/50">
                    <DockItem to="/dashboard" icon={<Home className="w-6 h-6" />} label="Home" isActive={location.pathname === '/dashboard'} />
                    <DockItem to="/vocab" icon={<Book className="w-6 h-6" />} label="Vocab" isActive={location.pathname === '/vocab'} />
                    <DockItem to="/flashcards" icon={<Layers className="w-6 h-6" />} label="Flashcards" isActive={location.pathname === '/flashcards'} />
                    <DockItem to="/practice" icon={<PenTool className="w-6 h-6" />} label="Practice" isActive={location.pathname === '/practice'} />
                    <DockItem to="/reading" icon={<BookOpen className="w-6 h-6" />} label="Reading" isActive={location.pathname === '/reading'} />
                    <DockItem to="/grammar" icon={<Pilcrow className="w-6 h-6" />} label="Grammar" isActive={location.pathname === '/grammar'} />
                    <div className="w-px h-8 bg-white/10 mx-2" />
                    <DockItem to="/library" icon={<Book className="w-6 h-6" />} label="Library" isActive={location.pathname === '/library'} />
                    <DockItem to="/import" icon={<Upload className="w-6 h-6" />} label="Import" isActive={location.pathname === '/import'} />
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
