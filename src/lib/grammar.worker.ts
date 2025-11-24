import { pipeline, env } from '@xenova/transformers';

// Skip local checks since we are running in browser
env.allowLocalModels = false;
env.useBrowserCache = true;

class GrammarWorker {
    static instance: any = null;
    static modelId = 'Xenova/flan-t5-small';

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
    const { type, text } = event.data;

    if (type === 'fix_grammar') {
        try {
            const generator = await GrammarWorker.getInstance((data: any) => {
                self.postMessage({
                    status: 'loading',
                    ...data
                });
            });

            // Prompt engineering for Flan-T5
            const prompt = `Fix grammar: ${text}`;

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
});
