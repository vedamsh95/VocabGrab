import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Activity, Volume2, AlertCircle } from 'lucide-react';
import { LiveClient } from '../../lib/liveClient';
import { clsx } from 'clsx';

const LiveTutor: React.FC = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const clientRef = useRef<LiveClient | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        return () => {
            if (clientRef.current) {
                clientRef.current.disconnect();
            }
        };
    }, []);

    const handleConnect = async () => {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            setError("Please add your Gemini API Key in the AI Generator or Settings first.");
            return;
        }

        setStatus('connecting');
        setError(null);

        try {
            const client = new LiveClient({ apiKey });
            clientRef.current = client;

            client.on('connected', () => {
                setStatus('connected');
                setIsConnected(true);
                client.startAudioStream();
            });

            client.on('disconnected', () => {
                setStatus('idle');
                setIsConnected(false);
            });

            client.on('error', (err) => {
                console.error("Live Client Error:", err);
                setError("Connection failed. Please check your API key or try again.");
                setStatus('error');
                setIsConnected(false);
            });

            await client.connect();

        } catch (err) {
            setError("Failed to initialize audio. Please allow microphone access.");
            setStatus('error');
        }
    };

    const handleDisconnect = () => {
        if (clientRef.current) {
            clientRef.current.disconnect();
        }
    };

    const toggleMute = () => {
        // Note: Real mute implementation would suspend the audio stream
        setIsMuted(!isMuted);
    };

    // Simple visualizer simulation (since we don't have easy access to the raw audio buffer in the UI component yet)
    // In a full implementation, we'd hook into the AudioContext analyser.
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-rose-500" />
                        Live Tutor
                    </h2>
                    <p className="text-slate-400 text-sm">Real-time voice conversation with Gemini</p>
                </div>
                <div className={clsx(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                    status === 'connected' ? "bg-emerald-500/20 text-emerald-400" :
                        status === 'connecting' ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-slate-500/20 text-slate-400"
                )}>
                    <div className={clsx(
                        "w-2 h-2 rounded-full",
                        status === 'connected' ? "bg-emerald-400 animate-pulse" :
                            status === 'connecting' ? "bg-yellow-400 animate-bounce" :
                                "bg-slate-400"
                    )} />
                    {status}
                </div>
            </div>

            {/* Main Visualizer Area */}
            <div className="flex-1 glass-panel rounded-3xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center p-8">

                {/* Background Ambient Glow */}
                <div className={clsx(
                    "absolute inset-0 transition-opacity duration-1000",
                    isConnected ? "opacity-100" : "opacity-0"
                )}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-75" />
                </div>

                <AnimatePresence mode="wait">
                    {!isConnected ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center z-10"
                        >
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <Phone size={40} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Talk?</h3>
                            <p className="text-slate-400 max-w-xs mx-auto mb-8">
                                Practice your speaking skills in a natural, real-time conversation.
                            </p>
                            <button
                                onClick={handleConnect}
                                disabled={status === 'connecting'}
                                className="px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full font-bold text-lg shadow-lg shadow-rose-500/20 hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
                            >
                                {status === 'connecting' ? 'Connecting...' : 'Start Call'}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full flex flex-col items-center justify-between z-10"
                        >
                            {/* AI Avatar / Visualizer */}
                            <div className="flex-1 flex items-center justify-center w-full">
                                <div className="relative">
                                    {/* Simulated Waveform Circle */}
                                    <div className="w-32 h-32 rounded-full border-4 border-rose-500/50 flex items-center justify-center relative">
                                        <div className="absolute inset-0 rounded-full border-4 border-rose-500/30 animate-ping" />
                                        <div className="w-24 h-24 rounded-full bg-rose-500 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.4)]">
                                            <Activity size={40} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-6 mb-8">
                                <button
                                    onClick={toggleMute}
                                    className={clsx(
                                        "p-4 rounded-full transition-all",
                                        isMuted ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white hover:bg-white/20"
                                    )}
                                >
                                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                </button>

                                <button
                                    onClick={handleDisconnect}
                                    className="p-6 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 transition-transform hover:scale-105"
                                >
                                    <PhoneOff size={32} />
                                </button>

                                <button className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all">
                                    <Volume2 size={24} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/90 text-white text-sm rounded-lg flex items-center gap-2 shadow-lg">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveTutor;
