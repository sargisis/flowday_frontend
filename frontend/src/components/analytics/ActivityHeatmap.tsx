import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

interface ActivityData {
    date: string;
    count: number;
}

interface ActivityHeatmapProps {
    data: ActivityData[];
    startDate?: Date;
    endDate?: Date;
}

export function ActivityHeatmap({ data, startDate, endDate }: ActivityHeatmapProps) {
    const now = new Date();
    const defaultStart = startDate || subDays(now, 365); // Last year
    const defaultEnd = endDate || now;

    // Create a map for quick lookup
    const dataMap = useMemo(() => {
        const map = new Map<string, number>();
        data.forEach(item => {
            map.set(item.date, item.count);
        });
        return map;
    }, [data]);

    // Generate all days in range
    const days = useMemo(() => {
        return eachDayOfInterval({ start: defaultStart, end: defaultEnd });
    }, [defaultStart, defaultEnd]);

    // Group by weeks for display
    const weeks = useMemo(() => {
        const weeksArray: Date[][] = [];
        let currentWeek: Date[] = [];

        days.forEach((day, index) => {
            if (index % 7 === 0 && currentWeek.length > 0) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
            currentWeek.push(day);
        });
        if (currentWeek.length > 0) {
            weeksArray.push(currentWeek);
        }

        return weeksArray;
    }, [days]);

    const getIntensity = (count: number): string => {
        if (count === 0) return 'bg-zinc-800/30';
        if (count <= 2) return 'bg-emerald-500/20';
        if (count <= 5) return 'bg-emerald-500/40';
        if (count <= 10) return 'bg-emerald-500/60';
        return 'bg-emerald-500/80';
    };

    const getTooltip = (day: Date, count: number): string => {
        const dateStr = format(day, 'MMM d, yyyy');
        return `${count} ${count === 1 ? 'activity' : 'activities'} on ${dateStr}`;
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="inline-flex gap-1 p-4">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const count = dataMap.get(dateStr) || 0;
                            const isToday = isSameDay(day, now);
                            
                            return (
                                <div
                                    key={dateStr}
                                    className={`w-3 h-3 rounded-sm ${getIntensity(count)} ${
                                        isToday ? 'ring-2 ring-indigo-500/50' : ''
                                    } transition-all hover:scale-125 cursor-pointer`}
                                    title={getTooltip(day, count)}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-zinc-500">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-zinc-800/30" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500/20" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500/40" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500/80" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
