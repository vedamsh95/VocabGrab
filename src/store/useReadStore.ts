import { create } from 'zustand';

interface ReadState {
    isPlaying: boolean;
    activeSegmentId: string | null;
    activeTokenIndex: number | null;
    playbackSpeed: number;

    play: () => void;
    pause: () => void;
    setSegment: (id: string | null) => void;
    setTokenIndex: (index: number | null) => void;
    setSpeed: (speed: number) => void;
}

export const useReadStore = create<ReadState>((set) => ({
    isPlaying: false,
    activeSegmentId: null,
    activeTokenIndex: null,
    playbackSpeed: 1.0,

    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    setSegment: (id) => set({ activeSegmentId: id }),
    setTokenIndex: (index) => set({ activeTokenIndex: index }),
    setSpeed: (speed) => set({ playbackSpeed: speed }),
}));
