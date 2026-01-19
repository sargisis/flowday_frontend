export type TaskStatus = 'Todo' | 'In_Progress' | 'Blocked' | 'Done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskFilters {
    status?: TaskStatus[];
    priority?: TaskPriority[];
    dueDate?: {
        type: 'before' | 'after' | 'between' | 'today' | 'thisWeek' | 'thisMonth';
        date?: Date;
        dateEnd?: Date;
    };
    createdDate?: {
        type: 'before' | 'after' | 'between' | 'today' | 'thisWeek' | 'thisMonth';
        date?: Date;
        dateEnd?: Date;
    };
    search?: string;
    tags?: string[];
    assignee?: string[];
    hasDescription?: boolean;
    hasSubtasks?: boolean;
    hasAttachments?: boolean;
}

export type SortField = 'title' | 'priority' | 'status' | 'dueDate' | 'createdDate' | 'updatedDate';
export type SortDirection = 'asc' | 'desc';

export interface TaskSort {
    field: SortField;
    direction: SortDirection;
}

export interface FilterPreset {
    id: string;
    name: string;
    description?: string;
    filters: TaskFilters;
    sort?: TaskSort;
    icon?: string;
}

export const DEFAULT_PRESETS: FilterPreset[] = [
    {
        id: 'all',
        name: 'All Tasks',
        description: 'Show all tasks',
        filters: {},
    },
    {
        id: 'high-priority',
        name: 'High Priority',
        description: 'Tasks with high priority',
        filters: {
            priority: ['high'],
        },
        sort: { field: 'priority', direction: 'desc' },
    },
    {
        id: 'due-soon',
        name: 'Due Soon',
        description: 'Tasks due in the next 3 days',
        filters: {
            dueDate: {
                type: 'before',
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
        },
        sort: { field: 'dueDate', direction: 'asc' },
    },
    {
        id: 'overdue',
        name: 'Overdue',
        description: 'Tasks past their due date',
        filters: {
            dueDate: {
                type: 'before',
                date: new Date(),
            },
            status: ['Todo', 'In_Progress', 'Blocked'],
        },
        sort: { field: 'dueDate', direction: 'asc' },
    },
    {
        id: 'in-progress',
        name: 'In Progress',
        description: 'Tasks currently being worked on',
        filters: {
            status: ['In_Progress'],
        },
        sort: { field: 'updatedDate', direction: 'desc' },
    },
    {
        id: 'blocked',
        name: 'Blocked',
        description: 'Tasks that are blocked',
        filters: {
            status: ['Blocked'],
        },
        sort: { field: 'updatedDate', direction: 'desc' },
    },
    {
        id: 'completed-today',
        name: 'Completed Today',
        description: 'Tasks completed today',
        filters: {
            status: ['Done'],
            createdDate: {
                type: 'today',
            },
        },
        sort: { field: 'updatedDate', direction: 'desc' },
    },
    {
        id: 'no-due-date',
        name: 'No Due Date',
        description: 'Tasks without a due date',
        filters: {
            dueDate: undefined,
        },
    },
];
