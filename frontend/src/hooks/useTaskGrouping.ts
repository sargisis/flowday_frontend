import { useMemo } from 'react';
import type { Task } from '../api/tasks';
import type { GroupBy, GroupingOptions } from '../types/filters';

export interface TaskGroup {
    id: string;
    label: string;
    tasks: Task[];
}

export function useTaskGrouping(tasks: Task[], grouping: GroupingOptions): TaskGroup[] {
    const groups = useMemo(() => {
        if (grouping.groupBy === 'none') {
            return [{
                id: 'all',
                label: 'All Tasks',
                tasks: tasks,
            }];
        }

        const grouped = new Map<string, Task[]>();

        tasks.forEach(task => {
            let groupKey: string;

            switch (grouping.groupBy) {
                case 'status':
                    groupKey = task.status || 'Unknown';
                    break;
                case 'priority':
                    groupKey = task.priority?.toLowerCase() || 'medium';
                    break;
                case 'dueDate':
                    if (!task.due_date) {
                        groupKey = 'no-due-date';
                    } else {
                        const dueDate = new Date(task.due_date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const nextWeek = new Date(today);
                        nextWeek.setDate(nextWeek.getDate() + 7);

                        dueDate.setHours(0, 0, 0, 0);

                        if (dueDate < today) {
                            groupKey = 'overdue';
                        } else if (dueDate.getTime() === today.getTime()) {
                            groupKey = 'today';
                        } else if (dueDate.getTime() === tomorrow.getTime()) {
                            groupKey = 'tomorrow';
                        } else if (dueDate <= nextWeek) {
                            groupKey = 'this-week';
                        } else {
                            groupKey = `month-${dueDate.getFullYear()}-${dueDate.getMonth()}`;
                        }
                    }
                    break;
                case 'assignee':
                    // For now, use project_id as assignee (can be enhanced later)
                    groupKey = task.project_id || 'unassigned';
                    break;
                case 'project':
                    groupKey = task.project_id || 'no-project';
                    break;
                default:
                    groupKey = 'other';
            }

            if (!grouped.has(groupKey)) {
                grouped.set(groupKey, []);
            }
            grouped.get(groupKey)!.push(task);
        });

        // Convert to array and sort
        const groupArray: TaskGroup[] = Array.from(grouped.entries()).map(([key, taskList]) => ({
            id: key,
            label: groupLabelForKey(key, grouping.groupBy),
            tasks: taskList,
        }));

        // Sort groups based on type
        groupArray.sort((a, b) => {
            switch (grouping.groupBy) {
                case 'status':
                    const statusOrder: Record<string, number> = {
                        'Todo': 1,
                        'In_Progress': 2,
                        'In Progress': 2,
                        'Blocked': 3,
                        'Done': 4,
                    };
                    return (statusOrder[a.id] || 99) - (statusOrder[b.id] || 99);
                case 'priority':
                    const priorityOrder: Record<string, number> = {
                        'high': 1,
                        'medium': 2,
                        'low': 3,
                    };
                    return (priorityOrder[a.id] || 99) - (priorityOrder[b.id] || 99);
                case 'dueDate':
                    const dueDateOrder: Record<string, number> = {
                        'overdue': 1,
                        'today': 2,
                        'tomorrow': 3,
                        'this-week': 4,
                    };
                    const aOrder = dueDateOrder[a.id] || 99;
                    const bOrder = dueDateOrder[b.id] || 99;
                    if (aOrder !== 99 || bOrder !== 99) {
                        return aOrder - bOrder;
                    }
                    // Sort months chronologically
                    return a.label.localeCompare(b.label);
                default:
                    return a.label.localeCompare(b.label);
            }
        });

        // Filter out empty groups if needed
        if (!grouping.showEmptyGroups) {
            return groupArray.filter(g => g.tasks.length > 0);
        }

        return groupArray;
    }, [tasks, grouping]);

    return groups;
}

function groupLabelForKey(key: string, groupBy: GroupBy): string {
    switch (groupBy) {
        case 'status':
            return key.replace('_', ' ');
        case 'priority':
            return key.charAt(0).toUpperCase() + key.slice(1);
        case 'dueDate':
            if (key === 'no-due-date') return 'No Due Date';
            if (key === 'overdue') return 'Overdue';
            if (key === 'today') return 'Today';
            if (key === 'tomorrow') return 'Tomorrow';
            if (key === 'this-week') return 'This Week';
            // For months, extract from key
            if (key.startsWith('month-')) {
                const parts = key.split('-');
                const year = parseInt(parts[1]);
                const month = parseInt(parts[2]);
                const date = new Date(year, month, 1);
                return date.toLocaleString('default', { month: 'long', year: 'numeric' });
            }
            return key;
        case 'assignee':
        case 'project':
            if (key === 'unassigned' || key === 'no-project') {
                return key === 'unassigned' ? 'Unassigned' : 'No Project';
            }
            return `Project ${key.slice(0, 8)}`;
        default:
            return key;
    }
}
