import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface XPRecord {
    date: string; // ISO date string YYYY-MM-DD
    amount: number;
}

interface ProgressState {
    streak: {
        count: number;
        lastLoginDate: string | null;
    };
    xp: {
        total: number;
        history: XPRecord[];
    };
    learnedWords: string[]; // Array of word IDs

    // Actions
    checkStreak: () => void;
    addXP: (amount: number) => void;
    markWordLearned: (wordId: string) => void;
    getWeeklyActivity: () => number[]; // Returns array of 7 numbers (last 7 days XP)
}

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            streak: {
                count: 0,
                lastLoginDate: null,
            },
            xp: {
                total: 0,
                history: [],
            },
            learnedWords: [],

            checkStreak: () => {
                const today = new Date().toISOString().split('T')[0];
                const { streak } = get();

                if (streak.lastLoginDate === today) return; // Already logged in today

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (streak.lastLoginDate === yesterdayStr) {
                    // Consecutive login
                    set({
                        streak: {
                            count: streak.count + 1,
                            lastLoginDate: today,
                        }
                    });
                } else {
                    // Streak broken or first login
                    set({
                        streak: {
                            count: 1,
                            lastLoginDate: today,
                        }
                    });
                }
            },

            addXP: (amount: number) => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => {
                    const newHistory = [...state.xp.history];
                    const todayRecordIndex = newHistory.findIndex(r => r.date === today);

                    if (todayRecordIndex >= 0) {
                        newHistory[todayRecordIndex].amount += amount;
                    } else {
                        newHistory.push({ date: today, amount });
                    }

                    return {
                        xp: {
                            total: state.xp.total + amount,
                            history: newHistory,
                        }
                    };
                });
            },

            markWordLearned: (wordId: string) => {
                set((state) => {
                    if (state.learnedWords.includes(wordId)) return state;
                    return { learnedWords: [...state.learnedWords, wordId] };
                });
            },

            getWeeklyActivity: () => {
                const { xp } = get();
                const activity: number[] = [];

                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    const record = xp.history.find(r => r.date === dateStr);
                    activity.push(record ? record.amount : 0);
                }

                return activity;
            }
        }),
        {
            name: 'user-progress',
        }
    )
);
