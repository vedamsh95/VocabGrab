import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Upload, Dumbbell, Layers, Save, ArrowRight, Sparkles } from 'lucide-react';

const GuidePage: React.FC = () => {
    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto pb-32">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-white mb-4">Welcome to LangApp</h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    A completely open, AI-powered language learning platform where <strong>you</strong> control the content.
                </p>
            </header>

            <div className="space-y-16">
                {/* Step 1: AI Generator */}
                <section className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                            <Sparkles size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">1. AI Generator</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Create custom study sets instantly using Google Gemini.
                        </p>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> <strong>Get a Key</strong>: Get a free API key from Google AI Studio.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> <strong>Choose Mode</strong>: Select "Vocabulary" for words or "Reading" for stories.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> <strong>Enter Topic</strong>: Be specific (e.g., "Ordering Coffee in Paris").</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> <strong>Generate</strong>: The AI builds a complete lesson for you!</li>
                        </ul>
                    </div>
                    <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/20 to-slate-900">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <Sparkles size={16} className="text-purple-400" />
                            </div>
                            <div className="text-sm text-white font-bold">AI Generator</div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 w-3/4 bg-white/10 rounded-full"></div>
                            <div className="h-2 w-1/2 bg-white/10 rounded-full"></div>
                            <div className="h-20 w-full bg-white/5 rounded-xl border border-white/5 mt-4"></div>
                        </div>
                    </div>
                </section>

                {/* Step 2: Import */}
                <section className="flex flex-col md:flex-row-reverse gap-8 items-center">
                    <div className="flex-1">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                            <Upload size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">2. Import JSON</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Prefer ChatGPT? You can still import manually.
                        </p>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Go to <strong>Import JSON</strong>.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Copy the <strong>System Prompt</strong>.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Paste it into ChatGPT.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Paste the result back here.</li>
                        </ul>
                    </div>
                    <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800">
                        <div className="font-mono text-xs text-emerald-400 mb-2">// Example JSON Output</div>
                        <pre className="text-xs text-slate-400 overflow-hidden">
                            {`{
  "title": "German Basics",
  "vocabulary": [
    { "word": "Hallo", "translation": "Hello" }
  ]
}`}
                        </pre>
                    </div>
                </section>

                {/* Step 3: Learn */}
                <section className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                            <Layers size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">3. Master Vocabulary</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Your imported words turn into interactive <strong>Flashcards</strong> and a <strong>Vocabulary Table</strong>.
                        </p>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Click cards to flip them.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Mark as "Known" to track progress.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Use TTS (Text-to-Speech) to hear pronunciation.</li>
                        </ul>
                    </div>
                    <div className="flex-1 h-48 glass-panel rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white mb-1">Haus</div>
                            <div className="text-sm text-blue-400">House</div>
                        </div>
                    </div>
                </section>

                {/* Step 4: Practice */}
                <section className="flex flex-col md:flex-row-reverse gap-8 items-center">
                    <div className="flex-1">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                            <Dumbbell size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">4. Practice Arena</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Test your knowledge with auto-generated exercises.
                        </p>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> <strong>Fill in the Blanks</strong>: Type the missing word.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> <strong>Multiple Choice</strong>: Select the correct translation.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> <strong>Smart Feedback</strong>: Get instant validation.</li>
                        </ul>
                    </div>
                    <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10">
                        <div className="text-sm text-slate-300 mb-3">I have a ___ cat.</div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50">small</span>
                            <span className="px-3 py-1 rounded-full bg-white/5 text-slate-500">blue</span>
                        </div>
                    </div>
                </section>

                {/* Step 5: Reading Lounge */}
                <section className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                            <BookOpen size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">5. Reading Lounge</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Immerse yourself in stories and conversations.
                        </p>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> <strong>Karaoke Mode</strong>: Listen and read along.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> <strong>Smart Analysis</strong>: Click any sentence for a grammar breakdown.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> <strong>X-Ray Mode</strong>: Color-code sentence structures.</li>
                        </ul>
                    </div>
                    <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10">
                        <div className="text-lg text-slate-300 leading-relaxed">
                            <span className="bg-purple-500/20 text-white px-1 rounded">Der alte Mann</span> saß auf der Bank.
                        </div>
                        <div className="mt-4 p-3 rounded-lg bg-black/40 text-xs text-slate-400">
                            <span className="text-purple-400 font-bold">Subject</span> • The old man
                        </div>
                    </div>
                </section>

                {/* Step 6: Backup */}
                <section className="flex flex-col md:flex-row-reverse gap-8 items-center">
                    <div className="flex-1">
                        <div className="w-12 h-12 rounded-xl bg-slate-700 text-slate-300 flex items-center justify-center mb-4">
                            <Save size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">6. Backup Your Data</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Your data lives in your browser. To keep it safe:
                        </p>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Go to <strong>Library</strong>.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Click <strong>Export All</strong> to download a backup file.</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Use <strong>Restore</strong> to load it back anytime.</li>
                        </ul>
                    </div>
                </section>

                <div className="pt-12 text-center">
                    <Link to="/dashboard" className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-3">
                        Start Learning <ArrowRight />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default GuidePage;
