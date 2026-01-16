import api from "./axios";

// Export tasks to CSV
export async function exportTasksCSV(projectId?: string): Promise<Blob> {
  const params = projectId ? { project_id: projectId } : {};
  const response = await api.get("/export/tasks/csv", {
    params,
    responseType: "blob",
  });
  return response.data;
}

// Export tasks to JSON
export async function exportTasksJSON(projectId?: string): Promise<any> {
  const params = projectId ? { project_id: projectId } : {};
  const response = await api.get("/export/tasks/json", { params });
  return response.data;
}

// Import tasks from CSV
export async function importTasksCSV(file: File): Promise<{
  imported: number;
  errors: string[];
  message: string;
}> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/import/tasks/csv", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

// Import tasks from JSON
export async function importTasksJSON(tasks: any[]): Promise<{
  imported: number;
  errors: string[];
  message: string;
}> {
  const response = await api.post("/import/tasks/json", tasks);
  return response.data;
}

// Helper to download CSV file
export function downloadCSV(blob: Blob, filename: string = "tasks_export.csv") {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Helper to download JSON file
export function downloadJSON(data: any, filename: string = "tasks_export.json") {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  downloadCSV(blob, filename);
}
