import { useMemo } from 'react';
import type { Task } from '../api/tasks';

interface TaskFilters {
    status?: string[];
    priority?: string[];
    searchQuery?: string;
    dueSoon?: boolean;
}

interface GroupedTasks {
    todo: Task[];
    inProgress: Task[];
    blocked: Task[];
    done: Task[];
}

/**
 * Hook for memoized task filtering and grouping
 * Optimizes expensive filtering operations
 */
export function useMemoizedTaskFilters(tasks: Task[], filters?: TaskFilters) {
    const filteredTasks = useMemo(() => {
        if (!filters) return tasks;

        return tasks.filter(task => {
            // Status filter
            if (filters.status && filters.status.length > 0) {
                const taskStatus = task.status.toLowerCase();
                if (!filters.status.some(s => taskStatus === s.toLowerCase())) {
                    return false;
                }
            }

            // Priority filter
            if (filters.priority && filters.priority.length > 0) {
                if (!filters.priority.includes(task.priority)) {
                    return false;
                }
            }

            // Search query filter
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const searchStr = `${task.title} ${task.description || ''} ${task.status} ${task.priority}`.toLowerCase();
                if (!searchStr.includes(query)) {
                    return false;
                }
            }

            // Due soon filter
            if (filters.dueSoon) {
                if (!task.due_date) return false;
                const threeDaysFromNow = new Date();
                threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
                const dueDate = new Date(task.due_date);
                if (dueDate > threeDaysFromNow || task.status.toLowerCase() === 'done') {
                    return false;
                }
            }

            return true;
        });
    }, [tasks, filters]);

    const groupedTasks: GroupedTasks = useMemo(() => {
        return {
            todo: filteredTasks.filter(t => t.status.toLowerCase() === 'todo'),
            inProgress: filteredTasks.filter(t => {
                const s = t.status.toLowerCase();
                return ['in_progress', 'review'].includes(s);
            }),
            blocked: filteredTasks.filter(t => t.status.toLowerCase() === 'blocked'),
            done: filteredTasks.filter(t => t.status.toLowerCase() === 'done'),
        };
    }, [filteredTasks]);

    const stats = useMemo(() => {
        const total = filteredTasks.length;
        const done = groupedTasks.done.length;
        const inProgress = groupedTasks.inProgress.length;
        const blocked = groupedTasks.blocked.length;
        const todo = groupedTasks.todo.length;
        const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

        return {
            total,
            done,
            inProgress,
            blocked,
            todo,
            completionRate,
        };
    }, [filteredTasks, groupedTasks]);

    return {
        filteredTasks,
        groupedTasks,
        stats,
    };
}
