import React, { useState } from 'react';
import { Popover } from 'react-tiny-popover';
import { getActiveSet, updateStudySet } from '../../lib/storage';
import { lookupWord, type DictionaryEntry } from '../../lib/dictionary';
import { getLanguageCode, getBestVoice } from '../../lib/languages';
import { clsx } from 'clsx';
import { Plus, Check, Book, Volume2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SmartSentenceProps {
    sentence: string;
    className?: string;
}

const SmartSentence: React.FC<SmartSentenceProps> = ({ sentence, className }) => {
    const activeSet = getActiveSet();
    const vocabList = activeSet?.vocabulary || [];

    // Split sentence into words but keep punctuation
    const tokens = sentence.split(/([ .,;?!]+)/).filter(Boolean);

    return (
        <div className={clsx("flex flex-wrap items-baseline gap-0.5 text-lg leading-relaxed", className)}>
            {tokens.map((token, index) => {
                const isWord = /^\w+$/.test(token);
                if (!isWord) return <span key={index} className="whitespace-pre">{token}</span>;

                const vocabItem = vocabList.find(v => v.word.toLowerCase() === token.toLowerCase());

                return (
                    <SmartWord
                        key={index}
                        word={token}
                        vocabItem={vocabItem}
                        sentenceContext={sentence}
                    />
                );
            })}
        </div>
    );
};

interface SmartWordProps {
    word: string;
    vocabItem?: { word: string; translation: string; grammarTip?: string };
    sentenceContext: string;
}

const SmartWord: React.FC<SmartWordProps> = ({ word, vocabItem, sentenceContext }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [dictionaryEntry, setDictionaryEntry] = useState<DictionaryEntry | null>(null);
    const [isAdded, setIsAdded] = useState(false);

    const handleOpen = () => {
        setIsPopoverOpen(!isPopoverOpen);
        if (!isPopoverOpen && !vocabItem) {
            // Perform lookup when opening if not already in vocab
            const entry = lookupWord(word);
            setDictionaryEntry(entry);
            setIsAdded(false); // Reset added state
        }
    };

    const handleAddToDeck = () => {
        if (!dictionaryEntry) return;

        const activeSet = getActiveSet();
        if (!activeSet) return;

        const newItem = {
            id: uuidv4(),
            word: dictionaryEntry.word,
            translation: dictionaryEntry.definition,
            exampleSentence: sentenceContext,
            grammarTip: `${dictionaryEntry.pos}${dictionaryEntry.gender ? ` (${dictionaryEntry.gender})` : ''}`
        };

        const updatedSet = {
            ...activeSet,
            vocabulary: [...(activeSet.vocabulary || []), newItem]
        };

        updateStudySet(updatedSet);
        setIsAdded(true);

        // Close popover after a short delay
        setTimeout(() => setIsPopoverOpen(false), 1500);
    };

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation();
        const utterance = new SpeechSynthesisUtterance(word);
        const activeSet = getActiveSet();
        const langCode = getLanguageCode(activeSet?.targetLanguage || 'German');
        utterance.lang = langCode;
        const voice = getBestVoice(langCode);
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <Popover
            isOpen={isPopoverOpen}
            positions={['top', 'bottom']}
            padding={10}
            onClickOutside={() => setIsPopoverOpen(false)}
            content={
                <div className="glass-panel p-4 rounded-xl shadow-xl border border-emerald-500/30 min-w-[220px] animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-bold text-white">{vocabItem ? vocabItem.word : (dictionaryEntry?.word || word)}</h4>
                        <div className="flex gap-2">
                            <button onClick={handleSpeak} className="p-1 hover:bg-white/10 rounded-full transition-colors text-emerald-400">
                                <Volume2 size={14} />
                            </button>
                            {vocabItem && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                        </div>
                    </div>

                    {vocabItem ? (
                        <>
                            <p className="text-emerald-400 font-medium mb-1">{vocabItem.translation}</p>
                            {vocabItem.grammarTip && (
                                <p className="text-xs text-slate-400 italic border-t border-white/10 pt-2 mt-2">
                                    Tip: {vocabItem.grammarTip}
                                </p>
                            )}
                        </>
                    ) : dictionaryEntry ? (
                        <>
                            <p className="text-emerald-400 font-medium mb-1">{dictionaryEntry.definition}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 italic border-t border-white/10 pt-2 mt-2 mb-3">
                                <span className="px-1.5 py-0.5 rounded bg-white/10">{dictionaryEntry.pos}</span>
                                {dictionaryEntry.gender && <span className="px-1.5 py-0.5 rounded bg-white/10">{dictionaryEntry.gender}</span>}
                            </div>

                            <button
                                onClick={handleAddToDeck}
                                disabled={isAdded}
                                className={clsx(
                                    "w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                                    isAdded
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                                )}
                            >
                                {isAdded ? (
                                    <>
                                        <Check className="w-3 h-3" /> Added to Deck
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-3 h-3" /> Add to Vocab
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-2">
                            <Book className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm">Word not found in dictionary.</p>
                        </div>
                    )}
                </div>
            }
        >
            <span
                className={clsx(
                    "cursor-pointer transition-colors border-b border-transparent hover:border-emerald-500/50",
                    vocabItem ? "text-emerald-200 hover:text-emerald-400" : "text-slate-300 hover:text-white"
                )}
                onClick={handleOpen}
            >
                {word}
            </span>
        </Popover>
    );
};

export default SmartSentence;
