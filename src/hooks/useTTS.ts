import { useCallback } from 'react';
import { getLanguageCode, getBestVoice } from '../lib/languages';

export const useTTS = () => {
    const speak = useCallback((text: string, languageName?: string) => {
        if (!text) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const langCode = getLanguageCode(languageName);
        utterance.lang = langCode;

        const voice = getBestVoice(langCode);
        if (voice) {
            utterance.voice = voice;
        }

        utterance.rate = 0.9; // Slightly slower for learning
        window.speechSynthesis.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
    }, []);

    return { speak, stop };
};
