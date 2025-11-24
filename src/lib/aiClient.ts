export class AIClient {
    private speechWorker: Worker | null = null;
    private grammarWorker: Worker | null = null;
    private onProgress: ((type: 'speech' | 'grammar', data: any) => void) | null = null;

    constructor(onProgress?: (type: 'speech' | 'grammar', data: any) => void) {
        this.onProgress = onProgress || null;
    }

    private initSpeechWorker() {
        if (!this.speechWorker) {
            this.speechWorker = new Worker(new URL('./speech.worker.ts', import.meta.url), {
                type: 'module'
            });
            this.speechWorker.addEventListener('message', (event) => {
                const { status, ...data } = event.data;
                if (status === 'loading' && this.onProgress) {
                    this.onProgress('speech', data);
                }
            });
        }
    }

    private initGrammarWorker() {
        if (!this.grammarWorker) {
            this.grammarWorker = new Worker(new URL('./grammar.worker.ts', import.meta.url), {
                type: 'module'
            });
            this.grammarWorker.addEventListener('message', (event) => {
                const { status, ...data } = event.data;
                if (status === 'loading' && this.onProgress) {
                    this.onProgress('grammar', data);
                }
            });
        }
    }

    public async transcribe(audio: Float32Array): Promise<string> {
        this.initSpeechWorker();
        return new Promise((resolve, reject) => {
            if (!this.speechWorker) return reject("Worker init failed");

            const handleMessage = (event: MessageEvent) => {
                const { status, output, error } = event.data;
                if (status === 'complete') {
                    this.speechWorker?.removeEventListener('message', handleMessage);
                    // Whisper output format: { text: "..." }
                    resolve(output.text || "");
                } else if (status === 'error') {
                    this.speechWorker?.removeEventListener('message', handleMessage);
                    reject(new Error(error));
                }
            };

            this.speechWorker.addEventListener('message', handleMessage);
            this.speechWorker.postMessage({ type: 'transcribe', audio });
        });
    }

    public async fixGrammar(text: string): Promise<string> {
        this.initGrammarWorker();
        return new Promise((resolve, reject) => {
            if (!this.grammarWorker) return reject("Worker init failed");

            const handleMessage = (event: MessageEvent) => {
                const { status, output, error } = event.data;
                if (status === 'complete') {
                    this.grammarWorker?.removeEventListener('message', handleMessage);
                    // Text generation output: [{ generated_text: "..." }]
                    resolve(output[0]?.generated_text || "");
                } else if (status === 'error') {
                    this.grammarWorker?.removeEventListener('message', handleMessage);
                    reject(new Error(error));
                }
            };

            this.grammarWorker.addEventListener('message', handleMessage);
            this.grammarWorker.postMessage({ type: 'fix_grammar', text });
        });
    }

    public terminate() {
        this.speechWorker?.terminate();
        this.grammarWorker?.terminate();
        this.speechWorker = null;
        this.grammarWorker = null;
    }
}
