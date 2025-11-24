import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Wand2, Check, Loader2, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { AIClient } from '../../lib/aiClient';
import { motion, AnimatePresence } from 'framer-motion';

const SmartSpeakingLab: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [inputText, setInputText] = useState('');
    const [correction, setCorrection] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingState, setLoadingState] = useState<{ type: 'speech' | 'grammar', progress: number } | null>(null);

    const aiClientRef = useRef<AIClient | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        aiClientRef.current = new AIClient((type, data) => {
            if (data.status === 'progress') {
                setLoadingState({ type, progress: data.progress || 0 });
            } else if (data.status === 'ready') {
                setLoadingState(null);
            }
        });

        return () => {
            aiClientRef.current?.terminate();
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                await processAudio(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setCorrection(null);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const processAudio = async (audioBlob: Blob) => {
        setIsProcessing(true);
        try {
            // Convert Blob to Float32Array for Whisper
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioContext = new AudioContext({ sampleRate: 16000 });
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const audioData = audioBuffer.getChannelData(0); // Get first channel

            if (aiClientRef.current) {
                const text = await aiClientRef.current.transcribe(audioData);
                setInputText(text);
                // Auto-fix grammar after transcription
                await analyzeGrammar(text);
            }
        } catch (err) {
            console.error("Transcription error:", err);
            alert("Failed to transcribe audio.");
        } finally {
            setIsProcessing(false);
        }
    };

    const analyzeGrammar = async (textToAnalyze?: string) => {
        const text = textToAnalyze || inputText;
        if (!text) return;

        setIsProcessing(true);
        try {
            if (aiClientRef.current) {
                const fixed = await aiClientRef.current.fixGrammar(text);
                setCorrection(fixed);
            }
        } catch (err) {
            console.error("Grammar analysis error:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto p-4 md:p-8">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Wand2 className="text-purple-400" /> Smart Speaking Lab
                </h2>
                <p className="text-slate-400">
                    Speak or type a sentence. The AI will transcribe it and fix your grammar instantly.
                </p>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
                {/* Input Section */}
                <div className="flex flex-col gap-4">
                    <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col relative border border-white/10">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Your Input</label>

                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type here or use the microphone..."
                            className="flex-1 bg-transparent border-none resize-none text-xl text-white placeholder:text-slate-600 focus:ring-0 focus:outline-none leading-relaxed"
                        />

                        <div className="mt-4 flex items-center justify-between">
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-lg",
                                    isRecording
                                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                                        : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20"
                                )}
                            >
                                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                                {isRecording ? "Stop Recording" : "Speak"}
                            </button>

                            <button
                                onClick={() => analyzeGrammar()}
                                disabled={!inputText || isProcessing}
                                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors disabled:opacity-50"
                                title="Analyze Grammar"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>

                        {/* Loading Overlay */}
                        <AnimatePresence>
                            {(isProcessing || loadingState) && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10"
                                >
                                    <Loader2 size={32} className="text-purple-400 animate-spin mb-4" />
                                    <p className="text-white font-medium">
                                        {loadingState
                                            ? `Loading ${loadingState.type === 'speech' ? 'Speech' : 'Grammar'} Model: ${Math.round(loadingState.progress)}%`
                                            : "Analyzing..."}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Output Section */}
                <div className="flex flex-col gap-4">
                    <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col border border-white/10 bg-gradient-to-br from-purple-900/10 to-transparent">
                        <label className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Wand2 size={14} /> AI Correction
                        </label>

                        {correction ? (
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="mb-6">
                                    <div className="text-sm text-slate-500 mb-1">Original</div>
                                    <div className="text-lg text-slate-300 line-through decoration-red-500/50 decoration-2">{inputText}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-emerald-500 mb-1 font-bold">Corrected</div>
                                    <div className="text-2xl text-white font-medium leading-relaxed">{correction}</div>
                                </div>

                                {inputText.trim().toLowerCase() === correction.trim().toLowerCase() && (
                                    <div className="mt-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400">
                                        <Check size={24} />
                                        <div>
                                            <div className="font-bold">Perfect!</div>
                                            <div className="text-sm opacity-80">No grammar errors found.</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-500 text-center">
                                <div>
                                    <Wand2 size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>Waiting for input...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartSpeakingLab;
