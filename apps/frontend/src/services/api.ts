import axios from 'axios';
import type {
  ApiResponse,
  CreateAssignmentResponse,
  AssignmentListItem,
  GeneratedPaper,
  JobStatus,
} from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ── Assignment APIs ─────────────────────────────────────────────────────────
export async function createAssignment(
  data: FormData
): Promise<CreateAssignmentResponse> {
  const response = await api.post<ApiResponse<CreateAssignmentResponse>>(
    '/assignments',
    data,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error);
  }

  return response.data.data;
}

export async function getAssignments(): Promise<AssignmentListItem[]> {
  const response = await api.get<ApiResponse<AssignmentListItem[]>>('/assignments');

  if (!response.data.success) {
    throw new Error(response.data.error);
  }

  return response.data.data;
}

export async function getAssignment(id: string): Promise<AssignmentListItem> {
  const response = await api.get<ApiResponse<AssignmentListItem>>(
    `/assignments/${id}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error);
  }

  return response.data.data;
}

export async function regenerateAssignment(
  id: string
): Promise<{ jobId: string }> {
  const response = await api.post<ApiResponse<{ jobId: string }>>(
    `/assignments/${id}/regenerate`
  );

  if (!response.data.success) {
    throw new Error(response.data.error);
  }

  return response.data.data;
}

export async function deleteAssignment(id: string): Promise<void> {
  const response = await api.delete<ApiResponse<null>>(`/assignments/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error);
  }
}

// ── Paper APIs ──────────────────────────────────────────────────────────────
export async function getPaper(
  assignmentId: string
): Promise<GeneratedPaper | null> {
  try {
    const response = await api.get<ApiResponse<GeneratedPaper>>(
      `/papers/${assignmentId}`
    );

    if (!response.data.success) {
      return null;
    }

    return response.data.data;
  } catch {
    return null;
  }
}

// ── Job APIs ────────────────────────────────────────────────────────────────
export async function getJobStatus(jobId: string): Promise<JobStatus | null> {
  try {
    const response = await api.get<ApiResponse<JobStatus>>(`/jobs/${jobId}`);

    if (!response.data.success) {
      return null;
    }

    return response.data.data;
  } catch {
    return null;
  }
}

export default api;
