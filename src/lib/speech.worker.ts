import { pipeline, env } from '@xenova/transformers';

// Skip local checks since we are running in browser
env.allowLocalModels = false;
env.useBrowserCache = true;

class SpeechWorker {
    static instance: any = null;
    static modelId = 'Xenova/whisper-tiny';

    static async getInstance(progressCallback: Function) {
        if (this.instance === null) {
            this.instance = await pipeline('automatic-speech-recognition', this.modelId, {
                quantized: false, // Whisper tiny is small enough, non-quantized might be better for quality, or stick to default
                progress_callback: progressCallback
            });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { type, audio } = event.data;

    if (type === 'transcribe') {
        try {
            const transcriber = await SpeechWorker.getInstance((data: any) => {
                self.postMessage({
                    status: 'loading',
                    ...data
                });
            });

            const output = await transcriber(audio, {
                language: 'german', // Force German for now, or make dynamic
                task: 'transcribe'
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
