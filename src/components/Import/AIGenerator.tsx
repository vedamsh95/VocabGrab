import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Sparkles, Key, Globe, AlertCircle, Check, Loader2, Save, RefreshCw, Cpu, BookOpen, List, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { addStudySet } from '../../lib/storage';
import { v4 as uuidv4 } from 'uuid';
import type { StudySet } from '../../types/schema';

const SYSTEM_PROMPT_VOCAB = `
You are a language learning content generator. Output ONLY valid JSON.
Schema:
{
  "title": "Topic Name",
  "targetLanguage": "German",
  "difficulty": "Beginner",
  "vocabulary": [
    { "word": "Apfel", "translation": "Apple", "exampleSentence": "Ich esse einen Apfel.", "grammarTip": "Masculine noun (der Apfel)" }
  ],
  "flashcards": [
    { "front": "Apfel", "back": "Apple" }
  ],
  "exercises": {
    "fillInBlanks": [
        { "id": "unique_id_1", "question": "Ich esse einen ___.", "answer": "Apfel" }
    ],
    "multipleChoice": [
        { "id": "unique_id_2", "question": "What is 'Apple'?", "answer": "Apfel", "options": ["Apfel", "Birne", "Banane"] }
    ]
  }
}
Generate 10-15 vocab items, flashcards, and mixed exercises.
`;

const SYSTEM_PROMPT_READING = `
You are a language learning content generator. Output ONLY valid JSON.
Schema:
{
  "title": "Story Title",
  "targetLanguage": "German",
  "difficulty": "Intermediate",
  "readingSections": [
    {
      "id": "unique_section_id",
      "title": "Chapter 1",
      "targetLanguage": "German",
      "mode": "Story", // or "Conversation"
      "content": [
        {
          "id": "sent_1",
          "speaker": "Narrator",
          "sentence": "Der alte Mann saß auf der Bank.",
          "translation": "The old man sat on the bench.",
          "formationNote": "Verb 'saß' is in Präteritum (past tense).",
          "smartLesson": {
            "construction": "clause: Subject + Verb + Place",
            "constructionNote": "Standard main clause word order.",
            "situation": "Narrative past tense."
          },
          "grammarTags": ["Präteritum", "Dative Preposition"],
          "grammarAnalysis": [
             { "segment": "Der alte Mann", "color": "blue", "label": "Subject" },
             { "segment": "saß", "color": "red", "label": "Verb" },
             { "segment": "auf der Bank", "color": "green", "label": "Place" }
          ]
        }
      ]
    }
  ]
}
Generate a short story or conversation with 8-12 sentences.
`;

interface AIGeneratorProps {
    onSuccess: () => void;
}

interface Model {
    name: string;
    displayName: string;
    description: string;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onSuccess }) => {
    const [apiKey, setApiKey] = useState('');
    const [topic, setTopic] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('German');
    const [difficulty, setDifficulty] = useState('Beginner');
    const [mode, setMode] = useState<'vocab' | 'reading'>('vocab');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedJson, setGeneratedJson] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    // Model selection state
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [isLoadingModels, setIsLoadingModels] = useState(false);

    // Load API Key from local storage
    useEffect(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) {
            setApiKey(storedKey);
            fetchModels(storedKey);
        }
    }, []);

    const handleSaveKey = () => {
        localStorage.setItem('gemini_api_key', apiKey);
    };

    const fetchModels = async (key: string) => {
        if (!key) return;
        setIsLoadingModels(true);
        setError(null);
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
            if (!response.ok) {
                console.warn("Failed to fetch models");
                return;
            }
            const data = await response.json();
            const availableModels = data.models?.filter((m: any) =>
                m.supportedGenerationMethods?.includes('generateContent')
            ) || [];

            setModels(availableModels);

            const preferred = availableModels.find((m: any) => m.name.includes('flash')) ||
                availableModels.find((m: any) => m.name.includes('pro')) ||
                availableModels[0];

            if (preferred) setSelectedModel(preferred.name);

        } catch (err) {
            console.error("Error fetching models:", err);
        } finally {
            setIsLoadingModels(false);
        }
    };

    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApiKey(e.target.value);
    };

    const handleKeyBlur = () => {
        handleSaveKey();
        if (apiKey && models.length === 0) {
            fetchModels(apiKey);
        }
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            setError("Please enter a valid API Key.");
            return;
        }
        if (!topic) {
            setError("Please enter a topic.");
            return;
        }

        const modelToUse = selectedModel || 'models/gemini-1.5-flash';

        setIsLoading(true);
        setError(null);
        setGeneratedJson(null);
        handleSaveKey();

        try {
            const systemPrompt = mode === 'vocab' ? SYSTEM_PROMPT_VOCAB : SYSTEM_PROMPT_READING;
            const prompt = `
            Topic: ${topic}
            Target Language: ${targetLanguage}
            Difficulty: ${difficulty}
            Mode: ${mode === 'vocab' ? 'Vocabulary & Exercises' : 'Reading Comprehension / Story'}
            
            ${systemPrompt}
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelToUse}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || "Failed to generate content");
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error("No content generated");

            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
            const jsonString = jsonMatch ? jsonMatch[1] : text;

            const parsed = JSON.parse(jsonString);
            if (!parsed.title) {
                throw new Error("Generated JSON is missing required fields");
            }

            // Inject difficulty if missing
            if (!parsed.difficulty) parsed.difficulty = difficulty;

            setGeneratedJson(JSON.stringify(parsed, null, 2));

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = () => {
        if (!generatedJson) return;

        try {
            const parsed = JSON.parse(generatedJson);
            const newSet: StudySet = {
                ...parsed,
                id: uuidv4(),
                createdAt: new Date().toISOString(),
                vocabulary: parsed.vocabulary || [],
                flashcards: parsed.flashcards || [],
                exercises: parsed.exercises || { fillInBlanks: [], multipleChoice: [] },
                readingSections: parsed.readingSections || [],
                difficulty: parsed.difficulty || difficulty
            };

            addStudySet(newSet);
            onSuccess();
            setTopic('');
            setGeneratedJson(null);
        } catch (err) {
            setError("Failed to import: " + (err as Error).message);
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">

            {/* Promo Tile */}
            <div className="glass-card p-8 rounded-3xl relative overflow-hidden border border-purple-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-black/60 z-0" />
                <div className="absolute top-0 right-0 p-8 opacity-20">
                    <Sparkles size={120} className="text-purple-400" />
                </div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
                        <Sparkles size={12} />
                        Powered by Gemini
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Generate Unlimited Study Sets <span className="text-purple-400">For Free</span>
                    </h2>
                    <p className="text-slate-300 mb-6 max-w-lg">
                        Use your own Gemini API key to create custom vocabulary lists, stories, and grammar lessons instantly. No subscription required.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Context-Aware Definitions
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Smart Example Sentences
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Grammar Tips Included
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Instant Generation
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Guide */}
            <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-2 text-emerald-400">
                        <HelpCircle size={18} />
                        <span className="font-medium text-sm">How to use AI Generator</span>
                    </div>
                    {showHelp ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>

                {showHelp && (
                    <div className="p-4 pt-0 text-sm text-slate-400 border-t border-white/5 bg-black/20">
                        <ol className="list-decimal list-inside space-y-2">
                            <li><strong>Get a Key:</strong> Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-emerald-400 hover:underline">Google AI Studio</a> and create a free API key.</li>
                            <li><strong>Paste Key:</strong> Paste it below. It's stored locally on your device.</li>
                            <li><strong>Select Mode:</strong> Choose "Vocabulary" for words/flashcards or "Reading" for stories.</li>
                            <li><strong>Enter Topic:</strong> Be specific! e.g., "Ordering at a French Bakery" or "Business Email Etiquette".</li>
                            <li><strong>Generate:</strong> Click generate and wait for the magic. Review and import!</li>
                        </ol>
                    </div>
                )}
            </div>

            {/* API Key Section */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                        <Key size={20} />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-slate-400 block mb-1">Gemini API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={handleKeyChange}
                            onBlur={handleKeyBlur}
                            placeholder="Paste your Google Gemini API Key here"
                            className="w-full bg-transparent border-none p-0 text-white focus:ring-0 placeholder:text-slate-600 font-mono text-sm"
                        />
                    </div>
                </div>

                {apiKey && (
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <Cpu size={20} />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-slate-400 block mb-1">AI Model</label>
                            {isLoadingModels ? (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Loader2 size={12} className="animate-spin" />
                                    Fetching available models...
                                </div>
                            ) : models.length > 0 ? (
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full bg-transparent border-none p-0 text-white focus:ring-0 font-mono text-sm cursor-pointer"
                                >
                                    {models.map(m => (
                                        <option key={m.name} value={m.name} className="bg-[#0a0c14]">
                                            {m.displayName || m.name.replace('models/', '')}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Default: gemini-1.5-flash</span>
                                    <button
                                        onClick={() => fetchModels(apiKey)}
                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                    >
                                        <RefreshCw size={10} /> Check Models
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Controls */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
                    {/* Mode Toggle */}
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setMode('vocab')}
                            className={clsx(
                                "flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                                mode === 'vocab' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <List size={16} /> Vocabulary
                        </button>
                        <button
                            onClick={() => setMode('reading')}
                            className={clsx(
                                "flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                                mode === 'reading' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <BookOpen size={16} /> Reading
                        </button>
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 block mb-2">Topic</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={mode === 'vocab' ? "e.g., Ordering Coffee, Business Meetings" : "e.g., A Mystery Story, News about Tech"}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">Target Language</label>
                            <div className="relative">
                                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <select
                                    value={targetLanguage}
                                    onChange={(e) => setTargetLanguage(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                                >
                                    <option value="German" className="bg-slate-900">German</option>
                                    <option value="Spanish" className="bg-slate-900">Spanish</option>
                                    <option value="French" className="bg-slate-900">French</option>
                                    <option value="Italian" className="bg-slate-900">Italian</option>
                                    <option value="Japanese" className="bg-slate-900">Japanese</option>
                                    <option value="Chinese" className="bg-slate-900">Chinese</option>
                                    <option value="Korean" className="bg-slate-900">Korean</option>
                                    <option value="Russian" className="bg-slate-900">Russian</option>
                                    <option value="Portuguese" className="bg-slate-900">Portuguese</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                            >
                                <option value="Beginner" className="bg-slate-900">Beginner (A1-A2)</option>
                                <option value="Intermediate" className="bg-slate-900">Intermediate (B1-B2)</option>
                                <option value="Advanced" className="bg-slate-900">Advanced (C1-C2)</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-auto">
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !topic || !apiKey}
                            className={clsx(
                                "w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-lg",
                                isLoading || !topic || !apiKey
                                    ? "bg-white/5 text-slate-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Generating Magic...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={24} />
                                    Generate {mode === 'vocab' ? 'Vocabulary' : 'Story'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    {generatedJson ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <Check size={18} className="text-emerald-400" />
                                    Ready to Import
                                </h3>
                                <span className="text-xs text-slate-400 font-mono">
                                    {(generatedJson.length / 1024).toFixed(1)} KB
                                </span>
                            </div>
                            <div className="flex-1 bg-[#02040a] rounded-xl p-4 overflow-y-auto mb-4 border border-white/10">
                                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
                                    {generatedJson}
                                </pre>
                            </div>
                            <button
                                onClick={handleImport}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Save to Library
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-8">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Sparkles size={40} className="opacity-20" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">AI Generator</h3>
                            <p className="max-w-xs mx-auto">
                                Enter a topic and let Gemini create a custom study set for you in seconds.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIGenerator;
