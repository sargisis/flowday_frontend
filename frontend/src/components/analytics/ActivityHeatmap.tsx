import { useMemo, useState } from 'react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import type { Task } from '../../api/tasks';
import { calculateTaskWeight, getActivityIntensity } from '../../utils/taskWeight';

interface ActivityData {
    date: string;
    count: number;
    weight?: number; // Total work weight for the day
    tasks?: Task[]; // Tasks completed on this day
}

interface ActivityHeatmapProps {
    data?: ActivityData[];
    tasks?: Task[]; // If provided, will calculate activity from tasks
    startDate?: Date;
    endDate?: Date;
}

export function ActivityHeatmap({ data, tasks, startDate, endDate }: ActivityHeatmapProps) {
    const now = new Date();
    const defaultStart = startDate || subDays(now, 365); // Last year
    const defaultEnd = endDate || now;
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Calculate activity from tasks if provided
    const calculatedData = useMemo(() => {
        if (!tasks || tasks.length === 0) return data || [];
        
        const activityMap = new Map<string, { count: number; weight: number; tasks: Task[] }>();
        
        tasks.forEach(task => {
            if (task.status.toLowerCase() !== 'done' || !task.created_at) return;
            
            // Use created_at as approximation for completion date
            const dateStr = format(new Date(task.created_at), 'yyyy-MM-dd');
            const existing = activityMap.get(dateStr) || { count: 0, weight: 0, tasks: [] };
            
            const weight = calculateTaskWeight(task);
            existing.count++;
            existing.weight += weight;
            existing.tasks.push(task);
            
            activityMap.set(dateStr, existing);
        });
        
        return Array.from(activityMap.entries()).map(([date, info]) => ({
            date,
            count: info.count,
            weight: info.weight,
            tasks: info.tasks,
        }));
    }, [tasks, data]);

    // Create a map for quick lookup with weight
    const dataMap = useMemo(() => {
        const map = new Map<string, { count: number; weight: number; tasks: Task[] }>();
        (calculatedData || []).forEach(item => {
            map.set(item.date, {
                count: item.count,
                weight: item.weight || item.count,
                tasks: item.tasks || [],
            });
        });
        return map;
    }, [calculatedData]);

    // Calculate max weight for intensity normalization
    const maxWeight = useMemo(() => {
        const weights = Array.from(dataMap.values()).map(d => d.weight);
        return Math.max(...weights, 1);
    }, [dataMap]);

    // Generate all days in range
    const days = useMemo(() => {
        return eachDayOfInterval({ start: defaultStart, end: defaultEnd });
    }, [defaultStart, defaultEnd]);

    // Group by weeks for display (GitHub style - starts from Sunday)
    const weeks = useMemo(() => {
        const weeksArray: Date[][] = [];
        let currentWeek: Date[] = [];
        
        // Find the first Sunday before or on start date
        let currentDay = new Date(defaultStart);
        const dayOfWeek = currentDay.getDay();
        if (dayOfWeek !== 0) {
            currentDay.setDate(currentDay.getDate() - dayOfWeek);
        }

        while (currentDay <= defaultEnd) {
            if (currentWeek.length === 7) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
            currentWeek.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        // Fill last week with empty days if needed
        while (currentWeek.length < 7 && currentWeek.length > 0) {
            currentWeek.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        if (currentWeek.length > 0) {
            weeksArray.push(currentWeek);
        }

        return weeksArray;
    }, [days, defaultStart, defaultEnd]);

    const getIntensity = (weight: number): string => {
        const intensity = getActivityIntensity(weight, maxWeight);
        // GitHub-like color scheme
        switch (intensity) {
            case 0: return 'bg-zinc-800/30 dark:bg-zinc-800/30';
            case 1: return 'bg-emerald-500/20 dark:bg-emerald-500/20';
            case 2: return 'bg-emerald-500/40 dark:bg-emerald-500/40';
            case 3: return 'bg-emerald-500/60 dark:bg-emerald-500/60';
            case 4: return 'bg-emerald-500 dark:bg-emerald-500';
            default: return 'bg-zinc-800/30 dark:bg-zinc-800/30';
        }
    };

    const getTooltipContent = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayData = dataMap.get(dateStr);
        
        if (!dayData || dayData.count === 0) {
            return {
                date: format(day, 'MMM d, yyyy'),
                count: 0,
                weight: 0,
                tasks: [],
            };
        }
        
        return {
            date: format(day, 'MMM d, yyyy'),
            count: dayData.count,
            weight: dayData.weight,
            tasks: dayData.tasks,
        };
    };

    const totalActivity = Array.from(dataMap.values()).reduce((sum, d) => sum + d.count, 0);
    const totalWeight = Array.from(dataMap.values()).reduce((sum, d) => sum + d.weight, 0);

    if (totalActivity === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-12 text-zinc-500">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm">No activity data yet</p>
                <p className="text-xs text-zinc-600 mt-1">Start completing tasks to see your activity heatmap</p>
            </div>
        );
    }

    const handleMouseEnter = (e: React.MouseEvent, day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        setHoveredDate(dateStr);
        setTooltipPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        setHoveredDate(null);
    };

    const tooltipData = hoveredDate ? getTooltipContent(new Date(hoveredDate + 'T00:00:00')) : null;

    return (
        <div className="w-full overflow-x-auto relative">
            {/* Summary Stats */}
            <div className="mb-4 flex items-center gap-4 text-sm text-zinc-400">
                <span>
                    <span className="font-semibold text-zinc-300">{totalActivity}</span> tasks completed
                </span>
                <span className="text-zinc-600">•</span>
                <span>
                    <span className="font-semibold text-zinc-300">{Math.round(totalWeight)}</span> work units
                </span>
            </div>

            {/* Heatmap Grid */}
            <div className="inline-flex gap-1 p-4">
                {/* Day labels (optional, can be added) */}
                {weeks.length > 0 && (
                    <div className="flex flex-col gap-1 pr-2 text-[10px] text-zinc-600">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                            idx % 2 === 0 && (
                                <div key={day} className="h-3 flex items-center">
                                    {day}
                                </div>
                            )
                        ))}
                    </div>
                )}
                
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const dayData = dataMap.get(dateStr);
                            const weight = dayData?.weight || 0;
                            const isToday = isSameDay(day, now);
                            const isInRange = day >= defaultStart && day <= defaultEnd;
                            
                            return (
                                <div
                                    key={dateStr}
                                    className={`w-3 h-3 rounded-sm ${getIntensity(weight)} ${
                                        isToday ? 'ring-2 ring-indigo-500/50' : ''
                                    } ${!isInRange ? 'opacity-30' : ''} transition-all hover:scale-125 cursor-pointer border border-zinc-800/50`}
                                    onMouseEnter={(e) => isInRange && handleMouseEnter(e, day)}
                                    onMouseLeave={handleMouseLeave}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Tooltip */}
            {tooltipData && hoveredDate && tooltipData.count > 0 && (
                <div
                    className="fixed z-50 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl pointer-events-none"
                    style={{
                        left: `${tooltipPosition.x + 10}px`,
                        top: `${tooltipPosition.y - 10}px`,
                        transform: 'translateY(-100%)',
                    }}
                >
                    <div className="text-xs font-semibold text-zinc-300 mb-1">
                        {tooltipData.count} {tooltipData.count === 1 ? 'task' : 'tasks'} completed
                    </div>
                    <div className="text-xs text-zinc-400">
                        {tooltipData.date}
                    </div>
                    {tooltipData.weight > 0 && (
                        <div className="text-xs text-emerald-400 mt-1">
                            {tooltipData.weight.toFixed(1)} work units
                        </div>
                    )}
                    {tooltipData.tasks && tooltipData.tasks.length > 0 && tooltipData.tasks.length <= 3 && (
                        <div className="mt-2 pt-2 border-t border-zinc-700 space-y-1">
                            {tooltipData.tasks.slice(0, 3).map(task => (
                                <div key={task.id} className="text-xs text-zinc-500 truncate max-w-[200px]">
                                    • {task.title}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 text-xs text-zinc-500">
                <span className="text-zinc-600">Less</span>
                <div className="flex gap-1 items-center">
                    <div className="w-3 h-3 rounded-sm bg-zinc-800/30 border border-zinc-800/50" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-zinc-800/50" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500/40 border border-zinc-800/50" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500/60 border border-zinc-800/50" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500 border border-zinc-800/50" />
                </div>
                <span className="text-zinc-600">More</span>
            </div>
        </div>
    );
}
