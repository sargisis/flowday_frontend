import { useMemo } from 'react';
import type { Task } from '../api/tasks';
import type { TaskFilters, TaskSort } from '../types/filters';

export function useTaskFilters(tasks: Task[], filters: TaskFilters, sort?: TaskSort) {
    const filteredAndSortedTasks = useMemo(() => {
        let result = [...tasks];

        // Apply filters
        if (filters.status && filters.status.length > 0) {
            result = result.filter(task => {
                const taskStatus = task.status as string;
                return filters.status!.some(status => 
                    taskStatus.toLowerCase() === status.toLowerCase()
                );
            });
        }

        if (filters.priority && filters.priority.length > 0) {
            result = result.filter(task => 
                filters.priority!.includes(task.priority?.toLowerCase() as 'high' | 'medium' | 'low')
            );
        }

        if (filters.dueDate) {
            const { type, date, dateEnd } = filters.dueDate;
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            result = result.filter(task => {
                if (!task.due_date) {
                    // If filtering by due date, exclude tasks without due dates
                    // unless explicitly filtering for "no due date"
                    return false;
                }

                const taskDueDate = new Date(task.due_date);
                taskDueDate.setHours(0, 0, 0, 0);

                switch (type) {
                    case 'before':
                        if (!date) return true;
                        return taskDueDate <= new Date(date);
                    case 'after':
                        if (!date) return true;
                        return taskDueDate >= new Date(date);
                    case 'between':
                        if (!date || !dateEnd) return true;
                        const start = new Date(date);
                        const end = new Date(dateEnd);
                        return taskDueDate >= start && taskDueDate <= end;
                    case 'today':
                        return taskDueDate.getTime() === now.getTime();
                    case 'thisWeek':
                        const weekStart = new Date(now);
                        weekStart.setDate(now.getDate() - now.getDay());
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        return taskDueDate >= weekStart && taskDueDate <= weekEnd;
                    case 'thisMonth':
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        return taskDueDate >= monthStart && taskDueDate <= monthEnd;
                    default:
                        return true;
                }
            });
        }

        if (filters.createdDate) {
            const { type, date, dateEnd } = filters.createdDate;
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            result = result.filter(task => {
                if (!task.created_at) return false;

                const taskCreatedDate = new Date(task.created_at);
                taskCreatedDate.setHours(0, 0, 0, 0);

                switch (type) {
                    case 'before':
                        if (!date) return true;
                        return taskCreatedDate <= new Date(date);
                    case 'after':
                        if (!date) return true;
                        return taskCreatedDate >= new Date(date);
                    case 'between':
                        if (!date || !dateEnd) return true;
                        const start = new Date(date);
                        const end = new Date(dateEnd);
                        return taskCreatedDate >= start && taskCreatedDate <= end;
                    case 'today':
                        return taskCreatedDate.getTime() === now.getTime();
                    case 'thisWeek':
                        const weekStart = new Date(now);
                        weekStart.setDate(now.getDate() - now.getDay());
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        return taskCreatedDate >= weekStart && taskCreatedDate <= weekEnd;
                    case 'thisMonth':
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        return taskCreatedDate >= monthStart && taskCreatedDate <= monthEnd;
                    default:
                        return true;
                }
            });
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(task => 
                task.title.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower)
            );
        }

        if (filters.hasDescription !== undefined) {
            result = result.filter(task => 
                filters.hasDescription ? !!task.description : !task.description
            );
        }

        if (filters.hasSubtasks !== undefined) {
            result = result.filter(task => 
                filters.hasSubtasks 
                    ? !!(task.subtasks && task.subtasks.length > 0)
                    : !(task.subtasks && task.subtasks.length > 0)
            );
        }

        if (filters.hasAttachments !== undefined) {
            result = result.filter(task => 
                filters.hasAttachments 
                    ? !!(task.attachments && task.attachments.length > 0)
                    : !(task.attachments && task.attachments.length > 0)
            );
        }

        // Apply sorting
        if (sort) {
            result.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (sort.field) {
                    case 'title':
                        aValue = a.title.toLowerCase();
                        bValue = b.title.toLowerCase();
                        break;
                    case 'priority':
                        const priorityWeight: Record<string, number> = { 'high': 3, 'medium': 2, 'low': 1 };
                        aValue = priorityWeight[a.priority?.toLowerCase() || 'medium'] || 0;
                        bValue = priorityWeight[b.priority?.toLowerCase() || 'medium'] || 0;
                        break;
                    case 'status':
                        const statusWeight: Record<string, number> = { 'todo': 1, 'in_progress': 2, 'blocked': 3, 'done': 4 };
                        aValue = statusWeight[a.status?.toLowerCase() || 'todo'] || 0;
                        bValue = statusWeight[b.status?.toLowerCase() || 'todo'] || 0;
                        break;
                    case 'dueDate':
                        aValue = a.due_date ? new Date(a.due_date).getTime() : Infinity;
                        bValue = b.due_date ? new Date(b.due_date).getTime() : Infinity;
                        break;
                    case 'createdDate':
                        aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
                        bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
                        break;
                    case 'updatedDate':
                        // Use created_at as fallback since updated_at might not exist
                        aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
                        bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [tasks, filters, sort]);

    return filteredAndSortedTasks;
}
