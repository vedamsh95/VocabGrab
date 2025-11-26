import EventEmitter from 'eventemitter3';

interface LiveClientConfig {
    apiKey: string;
    model?: string;
    voiceName?: string;
}

export class LiveClient extends EventEmitter {
    private ws: WebSocket | null = null;
    private config: LiveClientConfig;
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private audioInput: MediaStreamAudioSourceNode | null = null;
    private audioWorklet: AudioWorkletNode | null = null;
    private isConnected: boolean = false;

    constructor(config: LiveClientConfig) {
        super();
        this.config = {
            model: 'models/gemini-2.5-flash-live', // User requested model
            voiceName: 'Puck', // Default voice
            ...config
        };
    }

    async connect() {
        if (this.isConnected) return;

        const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.config.apiKey}`;

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                this.isConnected = true;
                this.emit('connected');
                this.sendSetupMessage();
            };

            this.ws.onmessage = async (event) => {
                await this.handleMessage(event.data);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                this.emit('error', new Error('WebSocket connection failed'));
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket Closed:', event.code, event.reason);
                this.isConnected = false;
                this.emit('disconnected');

                if (event.code !== 1000) {
                    this.emit('error', new Error(`Connection closed: ${event.code} ${event.reason || 'Unknown error'}`));
                }

                this.stopAudio();
            };

        } catch (error) {
            this.emit('error', error);
        }
    }

    private sendSetupMessage() {
        if (!this.ws) return;

        const setupMsg = {
            setup: {
                model: this.config.model,
                generation_config: {
                    response_modalities: ["AUDIO"],
                    speech_config: {
                        voice_config: {
                            prebuilt_voice_config: {
                                voice_name: this.config.voiceName
                            }
                        }
                    }
                }
            }
        };

        this.ws.send(JSON.stringify(setupMsg));
    }

    private async handleMessage(data: Blob | string) {
        if (data instanceof Blob) {
            // Handle binary audio data if sent as blob (unlikely for this API, usually JSON with base64)
        } else {
            try {
                const response = JSON.parse(data);

                // Handle ServerContent
                if (response.serverContent) {
                    const content = response.serverContent;

                    if (content.modelTurn) {
                        const parts = content.modelTurn.parts;
                        for (const part of parts) {
                            if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
                                this.playAudioChunk(part.inlineData.data);
                            }
                        }
                    }

                    if (content.turnComplete) {
                        this.emit('turnComplete');
                    }
                }
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        }
    }

    async startAudioStream() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 16000, // Gemini prefers 16kHz
            });

            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000
                }
            });

            // Check if still connected after async operation
            if (!this.isConnected || !this.audioContext) {
                if (this.mediaStream) {
                    this.mediaStream.getTracks().forEach(track => track.stop());
                }
                return;
            }

            // Load AudioWorklet for PCM processing
            const workletCode = `
                class PCMProcessor extends AudioWorkletProcessor {
                    process(inputs, outputs, parameters) {
                        const input = inputs[0];
                        if (input.length > 0) {
                            const float32Data = input[0];
                            // Convert to Int16
                            const int16Data = new Int16Array(float32Data.length);
                            for (let i = 0; i < float32Data.length; i++) {
                                const s = Math.max(-1, Math.min(1, float32Data[i]));
                                int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                            }
                            this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
                        }
                        return true;
                    }
                }
                registerProcessor('pcm-processor', PCMProcessor);
            `;

            const blob = new Blob([workletCode], { type: 'application/javascript' });
            const workletUrl = URL.createObjectURL(blob);

            await this.audioContext.audioWorklet.addModule(workletUrl);

            // Check again after async module load
            if (!this.isConnected || !this.audioContext) return;

            this.audioInput = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.audioWorklet = new AudioWorkletNode(this.audioContext, 'pcm-processor');

            this.audioWorklet.port.onmessage = (event) => {
                this.sendAudioChunk(event.data);
            };

            this.audioInput.connect(this.audioWorklet);
            this.audioWorklet.connect(this.audioContext.destination); // Connect to destination to keep it alive (usually muted)

        } catch (error) {
            console.error('Error starting audio stream:', error);
            this.emit('error', error);
        }
    }

    private sendAudioChunk(buffer: ArrayBuffer) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const base64Audio = this.arrayBufferToBase64(buffer);

        const msg = {
            realtimeInput: {
                mediaChunks: [{
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Audio
                }]
            }
        };

        this.ws.send(JSON.stringify(msg));
    }

    private playAudioChunk(base64Audio: string) {
        if (!this.audioContext) return;

        // Decode base64 to PCM
        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert PCM (Int16) to Float32 for playback
        const int16Data = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) {
            float32Data[i] = int16Data[i] / 32768.0;
        }

        const buffer = this.audioContext.createBuffer(1, float32Data.length, 24000); // Gemini output is usually 24kHz
        buffer.copyToChannel(float32Data, 0);

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start();
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    stopAudio() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    disconnect() {
        this.stopAudio();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
