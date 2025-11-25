export interface Token {
    text: string;
    isWord: boolean;
}

export const tokenizeText = (text: string, languageName: string = 'english'): Token[] => {
    // Map language name to code for Intl.Segmenter
    // We can reuse getLanguageCode logic or just basic mapping
    const langCodeMap: Record<string, string> = {
        'japanese': 'ja',
        'chinese': 'zh',
        'korean': 'ko',
        'german': 'de',
        'spanish': 'es',
        'french': 'fr',
        'italian': 'it',
        'portuguese': 'pt',
        'russian': 'ru',
        'english': 'en',
        'hindi': 'hi',
        'arabic': 'ar'
    };

    const langCode = langCodeMap[languageName.toLowerCase()] || 'en';

    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter(langCode, { granularity: 'word' });
        return Array.from(segmenter.segment(text)).map(segment => ({
            text: segment.segment,
            isWord: segment.isWordLike || false
        }));
    }

    // Fallback: Basic split (fails for CJK, but better than nothing)
    return text.split(/([ .,;?!]+)/).filter(Boolean).map(token => ({
        text: token,
        isWord: /^\w+$/.test(token)
    }));
};
