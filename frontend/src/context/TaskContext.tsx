import React, { createContext, useContext, useState, useCallback } from "react";
import { type Task, createTask as apiCreateTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask, decomposeTask as apiDecomposeTask, enrichTask as apiEnrichTask } from "../api/tasks";
import { useProject } from "./ProjectContext";
import { useUser } from "./UserContext";
import CreateTaskModal from "../components/CreateTaskModal";
import TaskDetailsModal from "../components/TaskDetailsModal";

interface TaskContextType {
    openCreateModal: (initialDate?: string) => void;
    openDetailsModal: (task: Task) => void;
    handleCreateTask: (title: string, priority: string, dueDate?: string) => Promise<void>;
    handleUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    handleDeleteTask: (taskId: string) => Promise<void>;
    handleDecomposeTask: (taskId: string) => Promise<void>;
    handleEnrichTask: (taskId: string) => Promise<string>; // Returns the new description
    refreshTrigger: number; // Increment this to trigger re-fetches in pages
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const { activeProjectId } = useProject();
    const { reloadUser } = useUser();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [initialDate, setInitialDate] = useState<string | undefined>(undefined);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    const openCreateModal = useCallback((date?: string) => {
        setInitialDate(date);
        setIsCreateModalOpen(true);
    }, []);

    const openDetailsModal = useCallback((task: Task) => {
        setSelectedTask(task);
    }, []);

    const handleCreateTask = async (title: string, priority: string, dueDate?: string) => {
        if (!activeProjectId) return;
        try {
            await apiCreateTask({
                title,
                priority,
                project_id: activeProjectId,
                due_date: dueDate ? new Date(dueDate).toISOString() : undefined
            });
            triggerRefresh();
        } catch (error) {
            console.error("Task creation failed", error);
            throw error;
        }
    };

    const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            await apiUpdateTask(taskId, updates);
            triggerRefresh();

            // If task was completed, refresh user to update XP/Level
            if (updates.status?.toLowerCase() === 'done') {
                reloadUser();
            }

            // Update selected task if it's the one being updated
            if (selectedTask?.id === taskId) {
                setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
            }
        } catch (error) {
            console.error("Task update failed", error);
            throw error;
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await apiDeleteTask(taskId);
            triggerRefresh();
            if (selectedTask?.id === taskId) {
                setSelectedTask(null);
            }
        } catch (error) {
            console.error("Task deletion failed", error);
            throw error;
        }
    };

    const handleDecomposeTask = async (taskId: string) => {
        try {
            await apiDecomposeTask(taskId);
            triggerRefresh();
        } catch (error) {
            console.error("Task decomposition failed", error);
            throw error;
        }
    };

    const handleEnrichTask = async (taskId: string) => {
        try {
            const res = await apiEnrichTask(taskId);
            triggerRefresh();
            return res.description;
        } catch (error) {
            console.error("Task enrichment failed", error);
            throw error;
        }
    };

    return (
        <TaskContext.Provider value={{
            openCreateModal,
            openDetailsModal,
            handleCreateTask,
            handleUpdateTask,
            handleDeleteTask,
            handleDecomposeTask,
            handleEnrichTask,
            refreshTrigger
        }}>
            {children}

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateTask}
                initialDate={initialDate}
            />

            {selectedTask && (
                <TaskDetailsModal
                    isOpen={!!selectedTask}
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                />
            )}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error("useTasks must be used within a TaskProvider");
    }
    return context;
}
