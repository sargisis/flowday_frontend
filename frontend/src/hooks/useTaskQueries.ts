import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getTasksByProject,
    updateTask,
    deleteTask,
    bulkDeleteTasks,
    type Task
} from '../api/tasks';
import { toast } from 'sonner';

// Query keys
export const taskKeys = {
    all: ['tasks'] as const,
    byProject: (projectId: string) => ['tasks', 'project', projectId] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
};

// Fetch tasks by project with React Query
export function useTasks(projectId: string | null) {
    return useQuery({
        queryKey: taskKeys.byProject(projectId || ''),
        queryFn: () => getTasksByProject(projectId!),
        enabled: !!projectId, // Only run if projectId exists
        staleTime: 2 * 60 * 1000, //  2 minutes
    });
}

// Update task with optimistic updates
export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
            updateTask(id, updates),
        onMutate: async ({ id, updates }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: taskKeys.all });

            // Snapshot previous value
            const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.all });

            // Optimistically update all task queries
            queryClient.setQueriesData({ queryKey: taskKeys.all }, (old: Task[] | undefined) => {
                if (!old) return old;
                return old.map(task => task.id === id ? { ...task, ...updates } : task);
            });

            return { previousTasks };
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousTasks) {
                context.previousTasks.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error('Failed to update task');
        },
        onSettled: () => {
            // Refetch после mutation
            queryClient.invalidateQueries({ queryKey: taskKeys.all });
        },
    });
}

// Delete task
export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (taskId: string) => deleteTask(taskId),
        onMutate: async (taskId) => {
            await queryClient.cancelQueries({ queryKey: taskKeys.all });

            const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.all });

            // Optimistically remove task
            queryClient.setQueriesData({ queryKey: taskKeys.all }, (old: Task[] | undefined) => {
                if (!old) return old;
                return old.filter(task => task.id !== taskId);
            });

            return { previousTasks };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousTasks) {
                context.previousTasks.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error('Failed to delete task');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.all });
        },
    });
}

// Bulk delete tasks
export function useBulkDeleteTasks() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (taskIds: string[]) => bulkDeleteTasks(taskIds),
        onMutate: async (taskIds) => {
            await queryClient.cancelQueries({ queryKey: taskKeys.all });

            const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.all });

            // Optimistically remove tasks
            queryClient.setQueriesData({ queryKey: taskKeys.all }, (old: Task[] | undefined) => {
                if (!old) return old;
                return old.filter(task => !taskIds.includes(task.id));
            });

            return { previousTasks };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousTasks) {
                context.previousTasks.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error('Failed to bulk delete tasks');
        },
        onSuccess: (_, taskIds) => {
            toast.success(`Deleted ${taskIds.length} tasks`);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.all });
        },
    });
}
