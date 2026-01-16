import api from "./axios";

export interface TaskDependency {
  depends_on: any[];
  blocks: any[];
  blocked_by: any[];
}

export interface AddDependencyRequest {
  depends_on_task_id: string;
}

export interface RemoveDependencyRequest {
  depends_on_task_id: string;
}

// Add a dependency to a task
export async function addTaskDependency(
  taskId: string,
  data: AddDependencyRequest
): Promise<void> {
  await api.post(`/tasks/${taskId}/dependencies`, data);
}

// Remove a dependency from a task
export async function removeTaskDependency(
  taskId: string,
  data: RemoveDependencyRequest
): Promise<void> {
  await api.delete(`/tasks/${taskId}/dependencies`, { data });
}

// Get all dependencies for a task
export async function getTaskDependencies(
  taskId: string
): Promise<TaskDependency> {
  const response = await api.get(`/tasks/${taskId}/dependencies`);
  return response.data;
}
