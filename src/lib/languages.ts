export const getLanguageCode = (languageName: string): string => {
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
