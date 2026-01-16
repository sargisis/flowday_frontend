import api from "./axios";

export interface TimeEntry {
  id: string;
  user_id: string;
  task_id: string;
  start_time: string;
  end_time?: string;
  duration: number; // In hours
  notes?: string;
  created_at: string;
}

export interface StartTimeEntryRequest {
  task_id: string;
}

export interface StopTimeEntryRequest {
  entry_id: string;
}

export interface TimeReport {
  total_hours: number;
  task_hours: Record<string, number>;
  project_hours: Record<string, number>;
  entries_count: number;
  entries: TimeEntry[];
}

// Start tracking time for a task
export async function startTimeEntry(
  data: StartTimeEntryRequest
): Promise<TimeEntry> {
  const response = await api.post("/time/start", data);
  return response.data;
}

// Stop tracking time
export async function stopTimeEntry(
  data: StopTimeEntryRequest
): Promise<TimeEntry> {
  const response = await api.post("/time/stop", data);
  return response.data;
}

// Get time entries
export async function getTimeEntries(taskId?: string): Promise<TimeEntry[]> {
  const params = taskId ? { task_id: taskId } : {};
  const response = await api.get("/time/entries", { params });
  return response.data;
}

// Delete a time entry
export async function deleteTimeEntry(entryId: string): Promise<void> {
  await api.delete(`/time/entries/${entryId}`);
}

// Get time tracking report
export async function getTimeReport(
  from?: string,
  to?: string
): Promise<TimeReport> {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const response = await api.get("/time/report", { params });
  return response.data;
}
