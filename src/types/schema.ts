export interface VocabItem {
    word: string;
    translation: string;
    exampleSentence?: string;
    grammarTip?: string;
}

export interface Flashcard {
    front: string;
    back: string;
}

export interface FillInBlankExercise {
    id: string;
    question: string; // "The ___ is red."
    answer: string;   // "apple"
}

export interface MultipleChoiceExercise {
    id: string;
    question: string;
    answer: string;
    options: string[];
}

export interface SmartLesson {
    construction: string;
    constructionNote?: string;
    situation: string;
}

export interface GrammarSegment {
    segment: string;
    color: 'blue' | 'red' | 'green' | 'yellow' | 'gray';
    label?: string;
}

export interface AnalyzedSentence {
    id: string;
    speaker?: string;
    sentence: string;
    translation: string;
    formationNote: string;
    smartLesson: SmartLesson;
    grammarTags: string[];
    grammarAnalysis?: GrammarSegment[];
}

export interface ReadingContent {
    id: string;
    title: string;
    targetLanguage: string;
    mode: 'Conversation' | 'Story' | 'News';
    content: AnalyzedSentence[];
}

export interface StudySet {
    id: string;
    title: string;
    targetLanguage: string;
    difficulty?: string;
    vocabulary: VocabItem[];
    flashcards: Flashcard[];
    exercises: {
        fillInBlanks: FillInBlankExercise[];
        multipleChoice: MultipleChoiceExercise[];
    };
    readingSections?: ReadingContent[];
    createdAt: string;
}

export interface AppState {
    studySets: StudySet[];
    activeSetId: string | null;
}
