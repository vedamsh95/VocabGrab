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
        'english': 'en-US',
        'hindi': 'hi-IN',
        'arabic': 'ar-SA'
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

export const getNLLBCode = (languageName?: string): string => {
    if (!languageName) return 'deu_Latn'; // Default to German if unknown
    const normalized = languageName.toLowerCase().trim();

    const map: Record<string, string> = {
        'german': 'deu_Latn',
        'deutsch': 'deu_Latn',
        'spanish': 'spa_Latn',
        'espanol': 'spa_Latn',
        'french': 'fra_Latn',
        'francais': 'fra_Latn',
        'italian': 'ita_Latn',
        'italiano': 'ita_Latn',
        'portuguese': 'por_Latn',
        'russian': 'rus_Cyrl',
        'japanese': 'jpn_Jpan',
        'chinese': 'zho_Hans', // Simplified by default
        'korean': 'kor_Hang',
        'english': 'eng_Latn',
        'hindi': 'hin_Deva',
        'arabic': 'arb_Arab'
    };

    return map[normalized] || 'eng_Latn';
};
