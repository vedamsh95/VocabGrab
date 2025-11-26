import React, { useState } from 'react';
import { Volume2, ChevronDown, ChevronUp, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getActiveSet } from '../../lib/storage';
import { clsx } from 'clsx';
import Logo from '../Common/Logo';
import { useTTS } from '../../hooks/useTTS';
import MorphologyViewer from '../Grammar/MorphologyViewer';

const VocabTable: React.FC = () => {
    const activeSet = getActiveSet();
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    if (!activeSet) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold text-white">No Study Set Selected</h2>
                <Link to="/import" className="text-emerald-400 hover:underline">Import a set first</Link>
            </div>
        );
    }

    const { speak } = useTTS();

    const handleSpeak = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        speak(text, activeSet?.targetLanguage);
    };

    const toggleRow = (index: number) => {
        setExpandedRow(expandedRow === index ? null : index);
    };

    const vocabList = activeSet.vocabulary || [];
    const filteredVocab = vocabList.filter(item =>
        (item.word || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.translation || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto min-h-screen">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Logo size="small" />
                    <Link to="/dashboard" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{activeSet.title}</h1>
                        <p className="text-slate-400">Vocabulary List • {activeSet.vocabulary?.length || 0} words</p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search words..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent outline-none w-full md:w-64 transition-all"
                    />
                </div>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 font-semibold text-slate-400 text-sm uppercase tracking-wider">Word</th>
                                <th className="p-4 font-semibold text-slate-400 text-sm uppercase tracking-wider">Translation</th>
                                <th className="p-4 font-semibold text-slate-400 text-sm uppercase tracking-wider hidden md:table-cell">Example</th>
                                <th className="p-4 font-semibold text-slate-400 text-sm uppercase tracking-wider hidden lg:table-cell">Morphology</th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredVocab.map((item, index) => (
                                <React.Fragment key={index}>
                                    <tr
                                        onClick={() => toggleRow(index)}
                                        className={clsx(
                                            "cursor-pointer transition-colors hover:bg-white/5",
                                            expandedRow === index ? "bg-white/5" : ""
                                        )}
                                    >
                                        <td className="p-4 font-medium text-white flex items-center gap-3">
                                            <button
                                                onClick={(e) => handleSpeak(item.word, e)}
                                                className="p-2 rounded-full bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors"
                                                title="Listen"
                                            >
                                                <Volume2 className="w-4 h-4" />
                                            </button>
                                            <span className="text-lg">{item.word}</span>
                                        </td>
                                        <td className="p-4 text-slate-300">{item.translation}</td>
                                        <td className="p-4 text-slate-500 hidden md:table-cell truncate max-w-xs">
                                            {item.exampleSentence}
                                        </td>
                                        <td className="p-4 text-slate-500 hidden lg:table-cell">
                                            {item.morphology ? (
                                                <div className="flex gap-1">
                                                    {item.morphology.map((m, i) => (
                                                        <span key={i} className={clsx(
                                                            "text-xs px-1.5 py-0.5 rounded",
                                                            m.type === 'root' ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                                                        )}>
                                                            {m.segment}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-600 text-xs italic">No data</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            {expandedRow === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </td>
                                    </tr>

                                    {expandedRow === index && (
                                        <tr className="bg-black/20">
                                            <td colSpan={4} className="p-4 md:p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Example Sentence</h4>
                                                        <p className="text-slate-200 italic">"{item.exampleSentence}"</p>
                                                    </div>
                                                    {item.grammarTip && (
                                                        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
                                                            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Grammar Tip</h4>
                                                            <p className="text-teal-100 text-sm">
                                                                {item.grammarTip}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {item.morphology && (
                                                        <div className="md:col-span-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Morphological Breakdown</h4>
                                                            <MorphologyViewer segments={item.morphology} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredVocab.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No vocabulary words found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default VocabTable;
