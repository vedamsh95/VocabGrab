import dictionaryData from '../data/german_dictionary.json';

export interface DictionaryEntry {
    word: string;
    definition: string;
    pos: string;
    gender?: string;
}

// The JSON is now a Hash Map: { "word": { ...entry } }
// We cast it to a Record type for TypeScript
const dictionary = dictionaryData as Record<string, DictionaryEntry>;

export const lookupWord = (word: string): DictionaryEntry | null => {
    const cleanWord = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

    // O(1) Lookup
    const entry = dictionary[cleanWord];

    return entry || null;
};
