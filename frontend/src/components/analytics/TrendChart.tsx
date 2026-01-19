import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface TrendDataPoint {
    date: string;
    value: number;
    label?: string;
}

interface TrendChartProps {
    data: TrendDataPoint[];
    period: '7d' | '30d' | '90d' | '1y';
    label?: string;
    color?: string;
}

export function TrendChart({ data, period, label = 'Value', color = 'indigo' }: TrendChartProps) {
    const colorClasses = {
        indigo: 'bg-indigo-500',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500',
    };

    const { chartData, maxValue } = useMemo(() => {
        const now = new Date();
        let daysBack = 7;
        if (period === '30d') daysBack = 30;
        else if (period === '90d') daysBack = 90;
        else if (period === '1y') daysBack = 365;

        const startDate = subDays(now, daysBack);
        const allDays = eachDayOfInterval({ start: startDate, end: now });

        // Create a map for quick lookup
        const dataMap = new Map<string, number>();
        data.forEach(item => {
            dataMap.set(item.date, item.value);
        });

        // Fill in missing days with 0
        const filledData = allDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            return {
                date: dateStr,
                value: dataMap.get(dateStr) || 0,
                label: format(day, period === '1y' ? 'MMM' : 'd'),
            };
        });

        const max = Math.max(...filledData.map(d => d.value), 1);

        return { chartData: filledData, maxValue: max };
    }, [data, period]);

    const totalValue = chartData.reduce((sum, point) => sum + point.value, 0);

    if (totalValue === 0) {
        return (
            <div className="w-full">
                {label && (
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
                        {label}
                    </h4>
                )}
                <div className="h-32 flex items-center justify-center text-zinc-500">
                    <div className="text-center">
                        <div className="text-2xl mb-1">📈</div>
                        <p className="text-xs">No data for this period</p>
                    </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-zinc-600">
                    <span>{format(chartData[0]?.date || new Date(), 'MMM d')}</span>
                    <span>{format(chartData[chartData.length - 1]?.date || new Date(), 'MMM d')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {label && (
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
                    {label}
                </h4>
            )}
            <div className="relative h-32 flex items-end gap-1">
                {chartData.map((point) => {
                    const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
                    return (
                        <div
                            key={point.date}
                            className="flex-1 flex flex-col items-center group"
                            title={`${point.label}: ${point.value}`}
                        >
                            <div
                                className={`w-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo} rounded-t transition-all hover:opacity-80 cursor-pointer`}
                                style={{ height: `${height}%`, minHeight: point.value > 0 ? '2px' : '0' }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-600">
                <span>{format(chartData[0]?.date || new Date(), 'MMM d')}</span>
                <span>{format(chartData[chartData.length - 1]?.date || new Date(), 'MMM d')}</span>
            </div>
        </div>
    );
}
