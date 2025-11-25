import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { clsx } from 'clsx';
import { Upload, FileJson, AlertCircle, Check, Copy, BookOpen, List, Sparkles, Pilcrow } from 'lucide-react';
import { addStudySet } from '../../lib/storage';
import { v4 as uuidv4 } from 'uuid';
import type { StudySet } from '../../types/schema';
import AIGenerator from './AIGenerator';
import Logo from '../Common/Logo';

const SYSTEM_PROMPT_VOCAB = `
You are a language learning content generator. Output ONLY valid JSON.
Schema:
{
  "title": "Topic Name",
  "targetLanguage": "German",
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
  "readingSections": [
    {
      "id": "unique_section_id",
      "title": "Chapter 1",
      "targetLanguage": "German", // Optional, inherits from set
      "mode": "Story", // or "Conversation"
      "content": [
        {
          "id": "sent_1",
          "speaker": "Narrator", // Optional for Story, Required for Conversation
          "sentence": "Der alte Mann saß auf der Bank.",
          "translation": "The old man sat on the bench.",
          "formationNote": "Verb 'saß' is in Präteritum (past tense). Do not just define words. Explain the structure. (Example: 'Notice that the adjective comes after the noun here, which is common in this language.') If it is a dialogue, explain the social tone (e.g., 'This is a formal way to ask, appropriate for a waiter.').",
          "smartLesson": {
            "construction": "clause: Subject (Der alte Mann) + Verb (saß) + Place (auf der Bank). This is the most important part. Explain the grammar lesson about this construction for example why verb is before adjective. Do not be generic. Bad Construction Note: 'This is a verb.' Good Construction Note: 'Notice that the verb 'kaufe' is at the start because this is a Yes/No question'",
            "constructionNote": "explain the above construction grammar tips in words",
            "situation": "Narrative past tense, used in written stories. Bad Situation Note: 'Used in German.' Good Situation Note: 'This phrase is very polite. Use it with strangers or bosses, but never with close friends.'"
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
For "Story" mode, ensure sentences flow naturally like a book paragraph.
For "Conversation" mode, include "speaker" names.
Color Rules for grammarAnalysis:
"blue": Subject / Actor
"red": Verb / Action
"green": Object / Receiver / Place / Time
"yellow": Adjectives, Adverbs, Connectors
"gray": Other
`;

const SYSTEM_PROMPT_GRAMMAR = `
You are an expert Applied Linguist and Curriculum Designer specializing in Second Language Acquisition (SLA).
Your goal is to generate a high-quality, modern grammar lesson structured in strict JSON format using the PPP Method (Presentation, Practice, Production).

Pedagogical Guidelines:
1. Context First: Always start with a functional "Hook" (a situation where the grammar is strictly necessary).
2. Inductive Approach: Prioritize showing examples before explaining the rule.
3. Contrastive Analysis: Explicitly highlight "false friends" or common errors learners make with this specific topic.
4. Tone: Encouraging, clear, and culturally relevant to the target language.

Output ONLY valid JSON.
Schema:
{
  "title": "Topic Name",
  "targetLanguage": "German",
  "difficulty": "B1",
  "grammarLessons": [
    {
      "lesson_meta": {
        "topic_id": "unique_id",
        "target_language": "German",
        "topic_name": "Topic Name",
        "cefr_level": "B1",
        "learning_objective": "By the end of this lesson..."
      },
      "pedagogy": {
        "hook": {
          "description": "Short scenario...",
          "content": "Dialogue or story...",
          "audio_script": "Optional script..."
        },
        "inductive_discovery": {
          "description": "Examples...",
          "examples": [
            { "sentence": "...", "translation": "...", "highlight_indices": [0, 5] }
          ]
        },
        "deductive_explanation": {
          "morphology": { "description": "...", "formula": "...", "exceptions": ["..."] },
          "pragmatics": { "description": "...", "usage_notes": "..." }
        },
        "contrastive_analysis": {
          "description": "Common mistakes...",
          "common_pitfalls": [
            { "incorrect": "...", "correct": "...", "explanation": "..." }
          ]
        }
      },
      "practice": {
        "scaffolded_exercises": [
          { "type": "multiple_choice", "question": "...", "options": ["..."], "correct_answer": "...", "hint": "..." }
        ]
      }
    }
  ],
  "vocabulary": [
    { "word": "...", "translation": "...", "exampleSentence": "...", "grammarTip": "..." }
  ],
  "flashcards": [
    { "front": "...", "back": "..." }
  ],
  "readingSections": [
    {
      "id": "reading_1",
      "title": "Short Story",
      "targetLanguage": "German",
      "mode": "Story",
      "content": [
        {
          "id": "sent_1",
          "speaker": "Narrator",
          "sentence": "...",
          "translation": "...",
          "formationNote": "...",
          "smartLesson": { "construction": "...", "situation": "..." },
          "grammarTags": ["..."]
        }
      ]
    }
  ],
  "exercises": {
    "fillInBlanks": [ { "id": "...", "question": "...", "answer": "..." } ],
    "multipleChoice": [ { "id": "...", "question": "...", "answer": "...", "options": ["..."] } ]
  }
}
Generate a complete lesson with 5 vocab items, 5 flashcards, 1 short story (5-8 sentences), and 5 exercises of each type.
`;

const JsonImporter: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showSyntax, setShowSyntax] = useState(false);
    const [activeTab, setActiveTab] = useState<'vocab' | 'reading' | 'grammar'>('vocab');
    const [mode, setMode] = useState<'json' | 'ai'>('json');

    useEffect(() => {
        const modeParam = searchParams.get('mode');
        if (modeParam === 'ai') {
            setMode('ai');
        } else {
            setMode('json');
        }
    }, [searchParams]);

    const handleImport = () => {
        try {
            const parsed = JSON.parse(jsonInput);

            // Basic validation
            if (!parsed.title || !parsed.targetLanguage) {
                throw new Error("Missing 'title' or 'targetLanguage'");
            }

            // Ensure ID and Date
            const newSet: StudySet = {
                ...parsed,
                id: uuidv4(),
                createdAt: new Date().toISOString(),
                vocabulary: parsed.vocabulary || [],
                flashcards: parsed.flashcards || [],
                exercises: parsed.exercises || { fillInBlanks: [], multipleChoice: [] },
                readingSections: (parsed.readingSections || []).map((section: any) => ({
                    ...section,
                    targetLanguage: parsed.targetLanguage // Inherit from set
                })),
                grammarLessons: parsed.grammarLessons || [],
                difficulty: parsed.difficulty || 'Beginner'
            };

            addStudySet(newSet);
            setSuccess(true);
            setError(null);
            setJsonInput('');
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError((err as Error).message);
            setSuccess(false);
        }
    };

    const copyPrompt = () => {
        const prompt = activeTab === 'vocab' ? SYSTEM_PROMPT_VOCAB :
            activeTab === 'reading' ? SYSTEM_PROMPT_READING : SYSTEM_PROMPT_GRAMMAR;
        navigator.clipboard.writeText(prompt);
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Logo size="small" />
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Import Studio</h2>
                    <p className="text-slate-400">Create new study sets from JSON or AI.</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setMode('json')}
                        className={clsx(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                            mode === 'json' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                        )}
                    >
                        JSON Paste
                    </button>
                    <button
                        onClick={() => setMode('ai')}
                        className={clsx(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                            mode === 'ai' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Sparkles size={14} />
                        AI Generator
                    </button>
                </div>
            </div>

            {mode === 'ai' ? (
                <AIGenerator onSuccess={() => setSuccess(true)} />
            ) : (
                <>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowSyntax(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition-colors text-sm"
                        >
                            <FileJson size={16} />
                            View Syntax Guide
                        </button>
                    </div>

                    {/* Editor Area */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                        {/* Input */}
                        <div className="glass-panel rounded-2xl p-1 flex flex-col">
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder="Paste JSON here..."
                                className="flex-1 bg-transparent border-none resize-none p-4 text-sm font-mono text-slate-300 focus:ring-0 focus:outline-none"
                                spellCheck={false}
                            />
                        </div>

                        {/* Preview / Status */}
                        <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            {success ? (
                                <div className="animate-in fade-in zoom-in duration-300">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                                        <Check size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Import Successful!</h3>
                                    <p className="text-slate-400">Your new study set has been added to the library.</p>
                                </div>
                            ) : error ? (
                                <div className="animate-in fade-in zoom-in duration-300">
                                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Invalid JSON</h3>
                                    <p className="text-red-400/80 max-w-xs mx-auto break-words">{error}</p>
                                </div>
                            ) : (
                                <div className="text-slate-500">
                                    <Upload size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>Paste your JSON code to preview<br />and import your content.</p>
                                </div>
                            )}

                            <div className="absolute bottom-6 left-0 right-0 px-6">
                                <button
                                    onClick={handleImport}
                                    disabled={!jsonInput}
                                    className={clsx(
                                        "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                                        jsonInput
                                            ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                                            : "bg-white/5 text-slate-500 cursor-not-allowed"
                                    )}
                                >
                                    <Upload size={18} />
                                    Import Study Set
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Syntax Modal */}
                    {showSyntax && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-[#0a0c14] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
                                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">JSON Syntax Guide</h3>
                                    <button onClick={() => setShowSyntax(false)} className="text-slate-400 hover:text-white">
                                        <AlertCircle size={24} className="rotate-45" />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-white/10">
                                    <button
                                        onClick={() => setActiveTab('vocab')}
                                        className={clsx(
                                            "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                            activeTab === 'vocab' ? "text-emerald-400 border-b-2 border-emerald-400 bg-white/5" : "text-slate-400 hover:text-white"
                                        )}
                                    >
                                        <List size={16} /> Vocabulary & Exercises
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reading')}
                                        className={clsx(
                                            "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                            activeTab === 'reading' ? "text-emerald-400 border-b-2 border-emerald-400 bg-white/5" : "text-slate-400 hover:text-white"
                                        )}
                                    >
                                        <BookOpen size={16} /> Reading & Stories
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('grammar')}
                                        className={clsx(
                                            "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                            activeTab === 'grammar' ? "text-emerald-400 border-b-2 border-emerald-400 bg-white/5" : "text-slate-400 hover:text-white"
                                        )}
                                    >
                                        <Pilcrow size={16} /> Grammar Lesson
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto flex-1 bg-[#02040a]">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-slate-400 text-sm">Copy this prompt to ChatGPT/Gemini to generate content.</p>
                                        <button
                                            onClick={copyPrompt}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            <Copy size={14} /> Copy Prompt
                                        </button>
                                    </div>
                                    <pre className="bg-white/5 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap border border-white/10">
                                        {activeTab === 'vocab' ? SYSTEM_PROMPT_VOCAB :
                                            activeTab === 'reading' ? SYSTEM_PROMPT_READING : SYSTEM_PROMPT_GRAMMAR}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default JsonImporter;
