export interface TranslationResult {
    translation_text: string;
}

export class TranslationClient {
    private worker: Worker | null = null;
    private onProgress: ((data: any) => void) | null = null;

    constructor(onProgress?: (data: any) => void) {
        this.onProgress = onProgress || null;
        this.initWorker();
    }

    private initWorker() {
        if (!this.worker) {
            this.worker = new Worker(new URL('./translation.worker.ts', import.meta.url), {
                type: 'module'
            });

            this.worker.addEventListener('message', (event) => {
                const { status, output, error, ...progressData } = event.data;

                if (status === 'loading' && this.onProgress) {
                    this.onProgress(progressData);
                }
            });
        }
    }

    public async translate(text: string, src: string = 'deu_Latn', tgt: string = 'eng_Latn'): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                reject(new Error("Worker not initialized"));
                return;
            }

            const handleMessage = (event: MessageEvent) => {
                const { status, output, error } = event.data;

                if (status === 'complete') {
                    this.worker?.removeEventListener('message', handleMessage);
                    // Output is usually [{ translation_text: "..." }]
                    resolve(output[0]?.translation_text || "");
                } else if (status === 'error') {
                    this.worker?.removeEventListener('message', handleMessage);
                    reject(new Error(error));
                }
            };

            this.worker.addEventListener('message', handleMessage);

            this.worker.postMessage({
                type: 'translate',
                text,
                src_lang: src,
                tgt_lang: tgt
            });
        });
    }

    public terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}
