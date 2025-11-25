import { pipeline, env } from '@xenova/transformers';

// Skip local checks since we are running in browser
env.allowLocalModels = false;
env.useBrowserCache = true;
// Disable multi-threading to avoid COEP/COOP header requirements
env.backends.onnx.wasm.numThreads = 1;

class GrammarWorker {
    static instance: any = null;
    // Upgrade to a smarter model (LaMini is better at following instructions than vanilla Flan-T5)
    static modelId = 'Xenova/LaMini-Flan-T5-248M';

    static async getInstance(progressCallback: Function) {
        if (this.instance === null) {
            this.instance = await pipeline('text2text-generation', this.modelId, {
                progress_callback: progressCallback
            });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { type, text, context } = event.data;

    if (type === 'fix_grammar') {
        try {
            const generator = await GrammarWorker.getInstance((data: any) => {
                self.postMessage({
                    status: 'loading',
                    ...data
                });
            });

            // More explicit prompt for the model
            const prompt = `Correct the grammar of the following German sentence: ${text}`;

            const output = await generator(prompt, {
                max_new_tokens: 100,
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

    if (type === 'explain_context') {
        try {
            const generator = await GrammarWorker.getInstance((data: any) => {
                self.postMessage({
                    status: 'loading',
                    ...data
                });
            });

            // Prompt for context-aware translation/explanation
            const prompt = `Explain the meaning of the word "${text}" in the context of this sentence: "${context}". Provide a short, direct translation or definition.`;

            const output = await generator(prompt, {
                max_new_tokens: 60,
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
