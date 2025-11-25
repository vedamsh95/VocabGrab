import { pipeline, env } from '@xenova/transformers';

// Skip local checks since we are running in browser
env.allowLocalModels = false;
env.useBrowserCache = true;
// Disable multi-threading to avoid COEP/COOP header requirements
env.backends.onnx.wasm.numThreads = 1;

class TranslationWorker {
    static instance: any = null;
    static modelId = 'Xenova/nllb-200-distilled-600M'; // Multilingual model

    static async getInstance(progressCallback: Function) {
        if (this.instance === null) {
            this.instance = await pipeline('translation', this.modelId, {
                progress_callback: progressCallback
            });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { type, text, src_lang, tgt_lang } = event.data;

    if (type === 'translate') {
        try {
            const translator = await TranslationWorker.getInstance((data: any) => {
                // Relay progress back to main thread
                self.postMessage({
                    status: 'loading',
                    ...data
                });
            });

            const output = await translator(text, {
                src_lang: src_lang, // e.g., 'deu_Latn'
                tgt_lang: tgt_lang, // e.g., 'eng_Latn'
            });

            self.postMessage({
                status: 'complete',
                output: output
            });

        } catch (err) {
            self.postMessage({
                status: 'error',
                error: (err as Error).message
            });
        }
    }
});
