export interface VocabItem {
    word: string;
    translation: string;
    exampleSentence?: string;
    grammarTip?: string;
    morphology?: MorphologySegment[];
}

export interface MorphologySegment {
    segment: string;
    gloss: string; // e.g., "have", "SBJV.PST.1SG"
    type: 'root' | 'prefix' | 'suffix' | 'infix';
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

export interface GrammarLesson {
    lesson_meta: {
        topic_id: string;
        target_language: string;
        topic_name: string;
        cefr_level: string;
        learning_objective: string;
    };
    pedagogy: {
        hook: {
            description: string;
            content: string;
            audio_script?: string;
        };
        inductive_discovery: {
            description: string;
            examples: {
                sentence: string;
                translation: string;
                highlight_indices: number[];
                morphology?: MorphologySegment[];
            }[];
        };
        deductive_explanation: {
            morphology: {
                description: string;
                formula: string;
                exceptions: string[];
            };
            pragmatics: {
                description: string;
                usage_notes: string;
            };
        };
        contrastive_analysis: {
            description: string;
            common_pitfalls: {
                incorrect: string;
                correct: string;
                explanation: string;
            }[];
        };
        morphology_focus?: {
            description: string;
            examples: {
                word: string;
                translation: string;
                morphology: MorphologySegment[];
            }[];
        };
    };
    practice: {
        scaffolded_exercises: ({
            type: "multiple_choice" | "gap_fill" | "sentence_reorder";
            question: string;
            options?: string[];
            correct_answer: string;
            hint?: string;
        } | {
            type: "morpheme_builder";
            word: string;
            translation: string;
            segments: { text: string; type: 'root' | 'prefix' | 'suffix' | 'infix'; meaning: string }[];
            hint?: string;
        })[];
    };
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
    grammarLessons?: GrammarLesson[];
    createdAt: string;
}

export interface AppState {
    studySets: StudySet[];
    activeSetId: string | null;
}
