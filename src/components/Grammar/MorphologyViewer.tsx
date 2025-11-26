import React from 'react';
import { clsx } from 'clsx';
import type { MorphologySegment } from '../../types/schema';

interface MorphologyViewerProps {
    segments: MorphologySegment[];
    className?: string;
}

const MorphologyViewer: React.FC<MorphologyViewerProps> = ({ segments, className }) => {
    if (!segments || segments.length === 0) return null;

    return (
        <div className={clsx("flex flex-wrap gap-1 items-end", className)}>
            {segments.map((seg, i) => (
                <div key={i} className="flex flex-col items-center group cursor-help">
                    <span className={clsx(
                        "px-2 py-1 rounded-t-md text-sm font-bold border-t border-l border-r border-white/10 transition-colors min-w-[2rem] text-center",
                        seg.type === 'root' ? "bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30" :
                            seg.type === 'prefix' ? "bg-purple-500/20 text-purple-300 group-hover:bg-purple-500/30" :
                                seg.type === 'suffix' ? "bg-blue-500/20 text-blue-300 group-hover:bg-blue-500/30" :
                                    "bg-slate-500/20 text-slate-300"
                    )}>
                        {seg.segment}
                    </span>
                    <span className="px-1 py-0.5 text-[10px] uppercase tracking-wider text-slate-500 group-hover:text-slate-300 font-mono bg-black/40 rounded-b-md w-full text-center border-b border-l border-r border-white/10 transition-colors">
                        {seg.gloss}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default MorphologyViewer;
