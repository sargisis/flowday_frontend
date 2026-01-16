import api from "./axios";

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  title: string;
  task_description?: string;
  priority: string;
  estimated_hours?: number;
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  project_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
}

export interface CreateTaskTemplateRequest {
  name: string;
  description?: string;
  title: string;
  task_description?: string;
  priority?: string;
  estimated_hours?: number;
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  project_id?: string;
}

export interface UpdateTaskTemplateRequest {
  name?: string;
  description?: string;
  title?: string;
  task_description?: string;
  priority?: string;
  estimated_hours?: number;
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  project_id?: string;
}

export interface CreateTaskFromTemplateRequest {
  project_id: string;
}

// Get all task templates
export async function getTaskTemplates(projectId?: string): Promise<TaskTemplate[]> {
  const params = projectId ? { project_id: projectId } : {};
  const response = await api.get("/templates", { params });
  return response.data;
}

// Get a specific template
export async function getTaskTemplate(templateId: string): Promise<TaskTemplate> {
  const response = await api.get(`/templates/${templateId}`);
  return response.data;
}

// Create a new template
export async function createTaskTemplate(
  data: CreateTaskTemplateRequest
): Promise<TaskTemplate> {
  const response = await api.post("/templates", data);
  return response.data;
}

// Update a template
export async function updateTaskTemplate(
  templateId: string,
  data: UpdateTaskTemplateRequest
): Promise<TaskTemplate> {
  const response = await api.patch(`/templates/${templateId}`, data);
  return response.data;
}

// Delete a template
export async function deleteTaskTemplate(templateId: string): Promise<void> {
  await api.delete(`/templates/${templateId}`);
}

// Create a task from a template
export async function createTaskFromTemplate(
  templateId: string,
  data: CreateTaskFromTemplateRequest
): Promise<any> {
  const response = await api.post(`/templates/${templateId}/create-task`, data);
  return response.data;
}
