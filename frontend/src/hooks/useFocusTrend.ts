import { useState, useEffect } from "react";
import { getTasksByRange } from "../api/tasks";

interface FocusData {
    day: string;
    percent: number;
}

export function useFocusTrend(activeProjectId: string | null | undefined, refreshTrigger: number) {
    const [focusData, setFocusData] = useState<FocusData[]>([]);

    useEffect(() => {
        const fetchFocusTrend = async () => {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 6); // Last 7 days including today

            const formatDate = (d: Date) => d.toISOString().split('T')[0];
            const tasksInRange = await getTasksByRange(formatDate(start), formatDate(end));

            const dailyStats = new Map<string, { total: number; done: number }>();

            // Initialize last 7 days with 0
            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const dateStr = formatDate(d);
                dailyStats.set(dateStr, { total: 0, done: 0 });
            }

            // Fill with task data
            tasksInRange.forEach(t => {
                if (t.due_date) {
                    const dateStr = t.due_date.split('T')[0];
                    if (dailyStats.has(dateStr)) {
                        const stat = dailyStats.get(dateStr)!;
                        stat.total++;
                        if (t.status.toLowerCase() === 'done') {
                            stat.done++;
                        }
                    }
                }
            });

            // Convert map to array
            const data: FocusData[] = [];
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const dateStr = formatDate(d);
                const stat = dailyStats.get(dateStr) || { total: 0, done: 0 };

                const percent = stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0;
                data.push({
                    day: daysOfWeek[d.getDay()],
                    percent: percent
                });
            }
            setFocusData(data);
        };

        if (activeProjectId) {
            fetchFocusTrend();
        }
    }, [activeProjectId, refreshTrigger]);

    return { focusData };
}
