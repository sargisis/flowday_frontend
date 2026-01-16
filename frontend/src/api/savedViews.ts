import api from "./axios";

export interface ViewFilters {
  status?: string[];
  priority?: string[];
  assignee_id?: string;
  project_id?: string;
  due_date_from?: string;
  due_date_to?: string;
  search_query?: string;
  has_subtasks?: boolean;
  is_recurring?: boolean;
}

export interface SavedView {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  project_id?: string;
  filters: ViewFilters;
  sort_by?: string;
  sort_order?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSavedViewRequest {
  name: string;
  description?: string;
  project_id?: string;
  filters: ViewFilters;
  sort_by?: string;
  sort_order?: string;
}

export interface UpdateSavedViewRequest {
  name?: string;
  description?: string;
  filters?: ViewFilters;
  sort_by?: string;
  sort_order?: string;
}

// Get all saved views
export async function getSavedViews(projectId?: string): Promise<SavedView[]> {
  const params = projectId ? { project_id: projectId } : {};
  const response = await api.get("/views", { params });
  // ✅ FIX: Ensure we always return an array, never null
  return Array.isArray(response.data) ? response.data : [];
}

// Get a specific saved view
export async function getSavedView(viewId: string): Promise<SavedView> {
  const response = await api.get(`/views/${viewId}`);
  return response.data;
}

// Create a new saved view
export async function createSavedView(
  data: CreateSavedViewRequest
): Promise<SavedView> {
  const response = await api.post("/views", data);
  return response.data;
}

// Update a saved view
export async function updateSavedView(
  viewId: string,
  data: UpdateSavedViewRequest
): Promise<SavedView> {
  const response = await api.patch(`/views/${viewId}`, data);
  return response.data;
}

// Delete a saved view
export async function deleteSavedView(viewId: string): Promise<void> {
  await api.delete(`/views/${viewId}`);
}
