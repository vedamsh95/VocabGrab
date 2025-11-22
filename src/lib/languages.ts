export const getLanguageCode = (languageName?: string): string => {
    if (!languageName) return 'en-US';
    const normalized = languageName.toLowerCase().trim();

    const map: Record<string, string> = {
        'german': 'de-DE',
        'deutsch': 'de-DE',
        'spanish': 'es-ES',
        'espanol': 'es-ES',
        'french': 'fr-FR',
        'francais': 'fr-FR',
        'italian': 'it-IT',
        'italiano': 'it-IT',
        'portuguese': 'pt-BR',
        'russian': 'ru-RU',
        'japanese': 'ja-JP',
        'chinese': 'zh-CN',
        'korean': 'ko-KR',
        'english': 'en-US'
    };

    return map[normalized] || 'en-US';
};

export const getBestVoice = (langCode: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();

    // 1. Exact match
    let voice = voices.find(v => v.lang === langCode);
    if (voice) return voice;

    // 2. Base language match (e.g., 'de' matches 'de-DE')
    const baseLang = langCode.split('-')[0];
    voice = voices.find(v => v.lang.startsWith(baseLang));

    return voice || null;
};
