import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../../german_english_final.csv');
const OUTPUT_FILE = path.join(__dirname, '../src/data/german_dictionary.json');

console.log(`Reading CSV from: ${INPUT_FILE}`);

try {
    const data = fs.readFileSync(INPUT_FILE, 'utf8');
    const lines = data.split('\n');

    // Skip header row
    const dictionary = {};
    let count = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV split (assuming no commas in fields for now based on inspection, 
        // or if there are, we might need a more robust parser, but let's try simple first)
        // The file seems to use simple commas.
        const parts = line.split(',');

        // word,translation,pos,gender
        // Some translations might have commas, so we need to be careful.
        // Actually, looking at the file content: "love; have sex" -> semicolons used for multiple meanings.
        // But "tribe; tribe" -> semicolons.
        // Let's assume the first comma separates word, second translation, etc.
        // Wait, if translation has commas, this split is bad.
        // Let's look at line 34: Bank,bench; bed; layer; bank; bank; bank; bench,noun,
        // It seems safe to split by comma if we assume the structure is consistent.
        // Let's try to parse carefully.

        // Better approach: 
        // 1. Word is up to first comma.
        // 2. Gender is after last comma (if present? No, header is word,translation,pos,gender)
        // 3. POS is second to last.
        // 4. Translation is everything in between.

        // Let's re-examine a line:
        // 2: Hallo,hallo,noun,
        // 82: Stein,stone; rock; ... ; pit,noun,

        // It seems the structure is: word, translation, pos, gender
        // If translation contains commas, we are in trouble with simple split.
        // But looking at the file, translations use semicolons ";" to separate meanings.
        // So simple split by comma might work if translation doesn't contain commas.
        // Let's assume standard CSV.

        const word = parts[0];
        const gender = parts[parts.length - 1]; // Last one
        const pos = parts[parts.length - 2];    // Second to last

        // Translation is everything from index 1 to length-2
        const translationParts = parts.slice(1, parts.length - 2);
        const translation = translationParts.join(',');

        if (word && translation) {
            // Normalize word for key (lowercase) to allow O(1) lookup
            // We store the original word in the object
            const key = word.toLowerCase();

            // If multiple entries for same word, we might overwrite. 
            // For a simple dictionary, taking the first or merging is a choice.
            // Let's just overwrite for now or keep first. 
            // Actually, let's keep the one that looks most complete or just the last one.
            // Or better, if it exists, maybe append definitions? 
            // For simplicity, let's just store the entry.

            dictionary[key] = {
                word: word,
                definition: translation.replace(/;/g, ', '), // Replace semicolons with commas for display
                pos: pos,
                gender: gender || undefined
            };
            count++;
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dictionary, null, 2));
    console.log(`Successfully converted ${count} words to ${OUTPUT_FILE}`);

} catch (err) {
    console.error('Error converting dictionary:', err);
    process.exit(1);
}
