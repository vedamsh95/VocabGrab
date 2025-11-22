import type { StudySet } from '../types/schema';

const STORAGE_KEY = 'lang_app_sets';
const ACTIVE_SET_KEY = 'lang_app_active_set_id';

// Get all saved study sets
export const getAllSets = (): StudySet[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to load study sets", e);
        return [];
    }
};

// Get the currently active set
export const getActiveSet = (): StudySet | null => {
    try {
        const sets = getAllSets();
        const activeId = localStorage.getItem(ACTIVE_SET_KEY);

        if (!activeId && sets.length > 0) {
            // Default to first set if none selected
            return sets[0];
        }

        return sets.find(s => s.id === activeId) || sets[0] || null;
    } catch (e) {
        return null;
    }
};

// Add a new study set (Appends instead of overwrites)
export const addStudySet = (newSet: StudySet): void => {
    try {
        const sets = getAllSets();
        const updatedSets = [...sets, newSet];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));

        // Automatically make the new set active
        setActiveSetId(newSet.id);
    } catch (e) {
        console.error("Failed to save study set", e);
    }
};

// Update an existing study set
export const updateStudySet = (updatedSet: StudySet): void => {
    try {
        const sets = getAllSets();
        const index = sets.findIndex(s => s.id === updatedSet.id);

        if (index !== -1) {
            sets[index] = updatedSet;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
        }
    } catch (e) {
        console.error("Failed to update study set", e);
    }
};

// Delete a study set
export const deleteStudySet = (id: string): void => {
    try {
        const sets = getAllSets();
        const updatedSets = sets.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));

        // If we deleted the active set, switch to another one
        const activeId = localStorage.getItem(ACTIVE_SET_KEY);
        if (activeId === id) {
            if (updatedSets.length > 0) {
                setActiveSetId(updatedSets[0].id);
            } else {
                localStorage.removeItem(ACTIVE_SET_KEY);
            }
        }
    } catch (e) {
        console.error("Failed to delete study set", e);
    }
};

// Set the active study set ID
export const setActiveSetId = (id: string): void => {
    localStorage.setItem(ACTIVE_SET_KEY, id);
    // Dispatch a custom event so components can react to storage changes
    window.dispatchEvent(new Event('storage-update'));
};

// Legacy support wrapper (to avoid breaking existing code temporarily)
export const saveStudySet = (set: StudySet) => addStudySet(set);
