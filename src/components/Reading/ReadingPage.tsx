import React from 'react';
import { getActiveSet } from '../../lib/storage';
import ReadingLounge from './ReadingLounge';
import { BookOpen } from 'lucide-react';

const ReadingPage: React.FC = () => {
    const activeSet = getActiveSet();
    const readingSections = (activeSet?.readingSections || []).filter(s => s && s.content);

    if (readingSections.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <BookOpen size={40} className="text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No Reading Content</h2>
                <p className="text-slate-400 max-w-md">
                    This study set doesn't have any stories or conversations yet.
                    Go to the Import Studio and generate a "Reading Set" to get started.
                </p>
            </div>
        );
    }

    // For now, just show the first section. 
    // In a real app, we'd have a selector or list of chapters.
    return <ReadingLounge content={readingSections[0]} />;
};

export default ReadingPage;
