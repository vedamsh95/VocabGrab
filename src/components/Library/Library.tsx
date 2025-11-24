import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book, Trash2, Play, Plus, Download, Upload, HelpCircle, CheckSquare, Square, BookOpen, List } from 'lucide-react';
import { getAllSets, getActiveSet, setActiveSetId, deleteStudySet, addStudySet } from '../../lib/storage';
import type { StudySet } from '../../types/schema';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import Logo from '../Common/Logo';

const Library: React.FC = () => {
    const [sets, setSets] = useState<StudySet[]>([]);
    const [activeSetId, setActiveSetIdState] = useState<string | null>(null);
    const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());
    const [showWhyExport, setShowWhyExport] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const loadData = () => {
        setSets(getAllSets());
        const active = getActiveSet();
        setActiveSetIdState(active ? active.id : null);
    };

    useEffect(() => {
        loadData();
        const handleStorageUpdate = () => loadData();
        window.addEventListener('storage-update', handleStorageUpdate);
        return () => window.removeEventListener('storage-update', handleStorageUpdate);
    }, []);

    const handleActivate = (id: string) => {
        setActiveSetId(id);
        setActiveSetIdState(id);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this study set?')) {
            deleteStudySet(id);
            loadData();
            if (selectedSets.has(id)) {
                const newSelected = new Set(selectedSets);
                newSelected.delete(id);
                setSelectedSets(newSelected);
            }
        }
    };

    const toggleSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSelected = new Set(selectedSets);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedSets(newSelected);
    };

    const handleExport = (exportAll: boolean) => {
        const setsToExport = exportAll
            ? sets
            : sets.filter(s => selectedSets.has(s.id));

        if (setsToExport.length === 0) return;

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(setsToExport, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `langapp_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedSets = JSON.parse(event.target?.result as string);
                if (Array.isArray(importedSets)) {
                    let count = 0;
                    importedSets.forEach((set: StudySet) => {
                        if (set.id && set.title && set.targetLanguage) {
                            addStudySet(set);
                            count++;
                        }
                    });
                    alert(`Successfully restored ${count} study sets!`);
                    loadData();
                } else {
                    alert('Invalid backup file format.');
                }
            } catch (err) {
                console.error(err);
                alert('Failed to parse backup file.');
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto pb-32 relative">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex items-center gap-4">
                    <Logo size="small" />
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Library</h1>
                        <p className="text-slate-400">Manage your study sets and progress.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 mr-2">
                        <button
                            onClick={() => handleExport(true)}
                            className="btn-secondary px-3 py-2 text-xs flex items-center gap-2"
                            title="Export all sets"
                        >
                            <Download className="w-4 h-4" /> Export All
                        </button>
                        {selectedSets.size > 0 && (
                            <button
                                onClick={() => handleExport(false)}
                                className="btn-secondary px-3 py-2 text-xs flex items-center gap-2 text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                            >
                                <Download className="w-4 h-4" /> Export Selected ({selectedSets.size})
                            </button>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn-secondary px-3 py-2 text-xs flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" /> Restore
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleRestore}
                            accept=".json"
                            className="hidden"
                        />
                        <button
                            onClick={() => setShowWhyExport(true)}
                            className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                            title="Why Export?"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </button>
                    </div>
                    <Link to="/import" className="btn-primary px-4 py-2 flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" />
                        New Set
                    </Link>
                </div>
            </header>

            {/* Why Export Modal */}
            <AnimatePresence>
                {showWhyExport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowWhyExport(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel p-8 max-w-md w-full rounded-2xl border border-white/10 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <HelpCircle className="text-emerald-400" /> Why Export?
                            </h3>
                            <div className="space-y-4 text-slate-300 leading-relaxed">
                                <p>
                                    Your library is currently saved in your <strong>browser's local storage</strong>. This is fast and private, but it has limitations:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    <li>If you <strong>clear your browser cache</strong>, your data will be deleted.</li>
                                    <li>If you use a <strong>different browser</strong>, your data won't be there.</li>
                                </ul>
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm">
                                    <strong>Recommendation:</strong> Regularly use the "Export All" button to download a backup file. You can use "Restore" to load it back anytime!
                                </div>
                            </div>
                            <button
                                onClick={() => setShowWhyExport(false)}
                                className="mt-6 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {sets.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-white/10">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Book className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Your library is empty</h3>
                    <p className="text-slate-400 mb-6">Import your first study set to get started.</p>
                    <Link to="/import" className="text-emerald-400 hover:text-emerald-300 font-medium">
                        Go to Import Studio &rarr;
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {sets.map((set) => (
                        <motion.div
                            key={set.id}
                            layoutId={set.id}
                            className={clsx(
                                "glass-card p-4 relative group cursor-pointer border-2 transition-all flex flex-col h-full",
                                activeSetId === set.id ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-transparent hover:border-white/10',
                                selectedSets.has(set.id) ? 'ring-2 ring-emerald-500/30' : ''
                            )}
                            onClick={() => handleActivate(set.id)}
                        >
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => toggleSelection(e, set.id)}
                                    className="text-slate-500 hover:text-emerald-400 transition-colors"
                                >
                                    {selectedSets.has(set.id) ? <CheckSquare size={16} className="text-emerald-400" /> : <Square size={16} />}
                                </button>
                            </div>

                            <div className="flex justify-between items-start mb-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                                    {set.targetLanguage.substring(0, 2).toUpperCase()}
                                </div>
                                {activeSetId === set.id && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        Active
                                    </div>
                                )}
                            </div>

                            <h3 className="text-sm font-bold text-white mb-1 line-clamp-2 leading-tight min-h-[2.5em]">{set.title}</h3>

                            {/* Metadata Tags */}
                            <div className="flex flex-wrap gap-1 mb-3">
                                {set.difficulty && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                                        {set.difficulty}
                                    </span>
                                )}
                                {set.vocabulary.length > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                                        <List size={8} /> Vocab
                                    </span>
                                )}
                                {set.readingSections && set.readingSections.length > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                                        <BookOpen size={8} /> Read
                                    </span>
                                )}
                            </div>

                            <div className="mt-auto pt-3 border-t border-white/5 flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleActivate(set.id);
                                        navigate('/dashboard');
                                    }}
                                    className="flex-1 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
                                >
                                    <Play size={10} /> Study
                                </button>
                                <button
                                    onClick={(e) => handleDelete(e, set.id)}
                                    className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                    title="Delete Set"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Library;
