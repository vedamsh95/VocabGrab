import React, { useState } from 'react';
import { Popover } from 'react-tiny-popover';
import { getActiveSet, updateStudySet } from '../../lib/storage';
import { lookupWord, type DictionaryEntry } from '../../lib/dictionary';
import { getNLLBCode } from '../../lib/languages';
import { useTTS } from '../../hooks/useTTS';
import { clsx } from 'clsx';
import { Plus, Check, Book, Volume2, Loader2, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { TranslationClient } from '../../lib/translationClient';

interface SmartSentenceProps {
    sentence: string;
    className?: string;
    translationClient?: TranslationClient | null;
}

const SmartSentence: React.FC<SmartSentenceProps> = ({ sentence, className, translationClient }) => {
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
                        translationClient={translationClient}
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
    translationClient?: TranslationClient | null;
}

const SmartWord: React.FC<SmartWordProps> = ({ word, vocabItem, sentenceContext, translationClient }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [dictionaryEntry, setDictionaryEntry] = useState<DictionaryEntry | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const { speak } = useTTS();
    const activeSet = getActiveSet();

    const handleOpen = async () => {
        setIsPopoverOpen(!isPopoverOpen);
        if (!isPopoverOpen && !vocabItem) {
            // Perform lookup when opening if not already in vocab

            if (translationClient) {
                setIsLoading(true);
                try {
                    const nllbCode = getNLLBCode(activeSet?.targetLanguage);
                    const translation = await translationClient.translate(word, nllbCode, 'eng_Latn');
                    setDictionaryEntry({
                        word: word,
                        definition: translation,
                        pos: 'Neural Translation',
                        gender: ''
                    });
                } catch (err) {
                    console.error("AI Lookup failed, falling back to dictionary", err);
                    const entry = lookupWord(word);
                    setDictionaryEntry(entry);
                } finally {
                    setIsLoading(false);
                }
            } else {
                const entry = lookupWord(word);
                setDictionaryEntry(entry);
            }

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
        speak(word, activeSet?.targetLanguage);
    };

    return (
        <Popover
            isOpen={isPopoverOpen}
            positions={['top', 'bottom']}
            padding={10}
            onClickOutside={() => setIsPopoverOpen(false)}
            content={
                <div className="glass-panel p-4 rounded-xl shadow-xl w-64 border border-white/10 animate-in fade-in zoom-in-95 duration-200 z-50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-4 space-y-2 text-emerald-400">
                            <Loader2 className="animate-spin w-6 h-6" />
                            <span className="text-xs font-medium">Asking AI...</span>
                        </div>
                    ) : dictionaryEntry ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                        {dictionaryEntry.word}
                                        {dictionaryEntry.pos === 'Neural Translation' && <Sparkles className="w-3 h-3 text-amber-400" />}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span className="italic">{dictionaryEntry.pos}</span>
                                        {dictionaryEntry.gender && (
                                            <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                                                {dictionaryEntry.gender}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={handleSpeak} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-emerald-400">
                                    <Volume2 size={16} />
                                </button>
                            </div>

                            <p className="text-sm text-slate-200 leading-relaxed border-l-2 border-emerald-500/30 pl-3">
                                {dictionaryEntry.definition}
                            </p>

                            <button
                                onClick={handleAddToDeck}
                                disabled={isAdded}
                                className={clsx(
                                    "w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all",
                                    isAdded
                                        ? "bg-emerald-500/20 text-emerald-400 cursor-default"
                                        : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                                )}
                            >
                                {isAdded ? (
                                    <>
                                        <Check size={16} />
                                        Added to Deck
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Add to Flashcards
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-slate-400">
                            <Book size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No definition found.</p>
                        </div>
                    )}
                </div>
            }
        >
            <span
                onClick={handleOpen}
                className={clsx(
                    "cursor-pointer transition-all rounded px-0.5 -mx-0.5",
                    vocabItem
                        ? "text-emerald-400 font-medium hover:bg-emerald-500/10"
                        : "hover:bg-white/10 hover:text-white decoration-slate-600 underline decoration-dotted underline-offset-4",
                    isPopoverOpen && "bg-white/10 text-white"
                )}
            >
                {word}
            </span>
        </Popover>
    );
};

export default SmartSentence;
