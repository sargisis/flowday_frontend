import React, { useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import type { ActivityData } from '../../api/analytics';

interface ActivityHeatmapProps {
    data: ActivityData[];
    isLoading?: boolean;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data, isLoading }) => {
    // Generate dates for the last 365 days
    const days = useMemo(() => {
        const end = new Date();
        const start = subDays(end, 364);
        return eachDayOfInterval({ start, end });
    }, []);

    // Helper to get color based on count (Emerald/Green GitHub style)
    const getColor = (count: number) => {
        if (count === 0) return 'bg-white/[0.03] border-white/5';
        if (count < 3) return 'bg-emerald-500/20 border-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.1)]';
        if (count < 6) return 'bg-emerald-500/40 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]';
        if (count < 10) return 'bg-emerald-500/75 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
        return 'bg-emerald-400 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]';
    };

    // Calculate months and their offsets for labels
    const months = useMemo(() => {
        const result: { label: string; weekIndex: number }[] = [];
        let currentMonth = -1;
        let weekCounter = 0;

        // We process by weeks to find when a new month starts in the first day of the week
        // or close to it for better alignment
        const end = new Date();
        const start = subDays(end, 364);
        const dayInterval = eachDayOfInterval({ start, end });

        for (let i = 0; i < dayInterval.length; i += 7) {
            const date = dayInterval[i];
            const monthIdx = date.getMonth();
            if (monthIdx !== currentMonth) {
                result.push({
                    label: format(date, 'MMM'),
                    weekIndex: weekCounter
                });
                currentMonth = monthIdx;
            }
            weekCounter++;
        }
        return result;
    }, []);

    // Group days by weeks (7 days each)
    const weeks = useMemo(() => {
        const result: Date[][] = [];
        const end = new Date();
        const start = subDays(end, 364);
        const allDays = eachDayOfInterval({ start, end });

        // Find the first day to align correctly (GitHub starts with Sun-Sat or similar)
        // Here we just chunk every 7 days from the start of our 365 range
        for (let i = 0; i < allDays.length; i += 7) {
            result.push(allDays.slice(i, i + 7));
        }

        return result;
    }, []);

    // Get count for a specific date
    const getCount = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const entry = data.find((d) => d.date === dateStr);
        return entry ? entry.count : 0;
    };

    if (isLoading) {
        return (
            <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse h-[200px] flex items-center justify-center">
                <div className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Resyncing Log...</div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] shadow-2xl relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider leading-none font-outfit">Consistency Graph</h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Rolling Mission Timeline</p>
                    </div>
                </div>
            </div>

            <div className="relative overflow-x-auto no-scrollbar pb-2">
                <div className="flex gap-2 min-w-max items-start">
                    {/* Day Labels */}
                    <div className="flex flex-col gap-[3.5px] pt-4 pr-1">
                        <span className="h-[9px] w-6" />
                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter h-[9px]">Mon</span>
                        <span className="h-[9px] w-6" />
                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter h-[9px]">Wed</span>
                        <span className="h-[9px] w-6" />
                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter h-[9px]">Fri</span>
                        <span className="h-[9px] w-6" />
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                        {/* Month Labels */}
                        <div className="flex h-4 mb-0.5 relative">
                            {months.map((m, idx) => (
                                <span
                                    key={idx}
                                    className="text-[9px] font-bold text-zinc-600 uppercase absolute whitespace-nowrap"
                                    style={{ left: `${m.weekIndex * 12.5}px` }}
                                >
                                    {m.label}
                                </span>
                            ))}
                        </div>

                        {/* Heatmap Grid */}
                        <div className="flex gap-[3.5px]">
                            {weeks.map((week, weekIdx) => (
                                <div key={weekIdx} className="flex flex-col gap-[3.5px]">
                                    {week.map((day, dayIdx) => {
                                        const count = getCount(day);
                                        return (
                                            <div
                                                key={dayIdx}
                                                className={`w-[9px] h-[9px] rounded-[1.5px] transition-all duration-300 hover:scale-[1.7] hover:z-20 cursor-help border ${getColor(count)}`}
                                                title={`${format(day, 'MMM d, yyyy')}: ${count} missions`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-end gap-2 pr-2">
                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Less</span>
                <div className="flex gap-1">
                    {[0, 2, 5, 8, 12].map((v) => (
                        <div key={v} className={`w-[9px] h-[9px] rounded-[1.5px] ${getColor(v)}`} />
                    ))}
                </div>
                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">More</span>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
