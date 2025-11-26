import { useCallback, useState } from 'react';
import { getLanguageCode, getBestVoice } from '../lib/languages';

export const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speak = useCallback((text: string, languageName?: string) => {
        if (!text) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        // Strip markdown symbols (asterisks, underscores, etc.) for clean speech
        const cleanText = text.replace(/[*_#`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const langCode = getLanguageCode(languageName);
        utterance.lang = langCode;

        const voice = getBestVoice(langCode);
        if (voice) {
            utterance.voice = voice;
        }

        utterance.rate = 0.9; // Slightly slower for learning

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    return { speak, stop, isSpeaking };
};
