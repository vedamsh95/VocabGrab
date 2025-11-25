import GrammarWorker from './grammar.worker?worker';

interface GrammarProgress {
    status: string;
    file?: string;
    progress?: number;
    output?: any;
    error?: string;
}

export class GrammarClient {
    private worker: Worker | null = null;
    private onProgress: (data: GrammarProgress) => void;

    constructor(onProgress: (data: GrammarProgress) => void) {
        this.onProgress = onProgress;
        this.worker = new GrammarWorker();
        this.worker.addEventListener('message', this.handleMessage);
    }

    private handleMessage = (event: MessageEvent) => {
        this.onProgress(event.data);
    };

    public async fixGrammar(text: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.worker) return reject('Worker not initialized');

            const handler = (event: MessageEvent) => {
                const { status, output, error } = event.data;
                if (status === 'complete') {
                    this.worker?.removeEventListener('message', handler);
                    // Output is usually an array of objects [{ generated_text: "..." }]
                    const result = Array.isArray(output) ? output[0].generated_text : output;
                    resolve(result);
                } else if (status === 'error') {
                    this.worker?.removeEventListener('message', handler);
                    reject(error);
                }
            };

            this.worker.addEventListener('message', handler);
            this.worker.postMessage({ type: 'fix_grammar', text });
        });
    }

    public async explainContext(word: string, context: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.worker) return reject('Worker not initialized');

            const handler = (event: MessageEvent) => {
                const { status, output, error } = event.data;
                if (status === 'complete') {
                    this.worker?.removeEventListener('message', handler);
                    const result = Array.isArray(output) ? output[0].generated_text : output;
                    resolve(result);
                } else if (status === 'error') {
                    this.worker?.removeEventListener('message', handler);
                    reject(error);
                }
            };

            this.worker.addEventListener('message', handler);
            this.worker.postMessage({ type: 'explain_context', text: word, context });
        });
    }

    public terminate() {
        this.worker?.terminate();
        this.worker = null;
    }
}
