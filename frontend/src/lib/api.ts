import { axiosInstance } from "./axiosInstance";
import {
  User,
  Subject,
  StudyGroup,
  StudySession,
  RoomMessage,
  DailyAnalytics,
  WeeklyAnalytics,
  SubjectAnalytics,
} from "@/types";

export const authApi = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await axiosInstance.post<{ message: string; user: User }>("/auth/register", data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await axiosInstance.post<{ message: string; user: User }>("/auth/login", data);
    return response.data;
  },
  logout: async () => {
    await axiosInstance.post("/auth/logout");
  },
  me: async () => {
    const response = await axiosInstance.get<User>("/auth/me");
    return response.data;
  },
};

export const usersApi = {
  getProfile: async () => {
    const response = await axiosInstance.get<User>("/users/profile");
    return response.data;
  },
  updateProfile: async (data: Partial<{ name: string; profileImageUrl: string; dailyGoalMinutes: number; bio: string }>) => {
    const response = await axiosInstance.put<User>("/users/profile", data);
    return response.data;
  },
  updateSubjects: async (subjectIds: number[]) => {
    const response = await axiosInstance.put<User>("/users/subjects", { subjectIds });
    return response.data;
  },
};

export const subjectsApi = {
  getAll: async () => {
    const response = await axiosInstance.get<Subject[]>("/subjects");
    return response.data;
  },
};

export const groupsApi = {
  create: async (data: {
    name: string;
    description?: string;
    subjectId: number;
    sessionType?: string;
    startTime: string;
    durationMinutes: number;
    breakDurationMinutes?: number;
    maxMembers?: number;
  }) => {
    const response = await axiosInstance.post<StudyGroup>("/groups", data);
    return response.data;
  },
  search: async (params?: { subjectId?: number; status?: string; startAfter?: string; startBefore?: string }) => {
    const response = await axiosInstance.get<StudyGroup[]>("/groups", { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await axiosInstance.get<StudyGroup>(`/groups/${id}`);
    return response.data;
  },
  update: async (id: number, data: Partial<StudyGroup>) => {
    const response = await axiosInstance.put<StudyGroup>(`/groups/${id}`, data);
    return response.data;
  },
  deleteGroup: async (id: number) => {
    await axiosInstance.delete(`/groups/${id}`);
  },
  join: async (id: number) => {
    const response = await axiosInstance.post<StudyGroup>(`/groups/${id}/join`);
    return response.data;
  },
  leave: async (id: number) => {
    await axiosInstance.post(`/groups/${id}/leave`);
  },
  getMessages: async (id: number) => {
    const response = await axiosInstance.get<RoomMessage[]>(`/groups/${id}/messages`);
    return response.data;
  },
};

export const sessionsApi = {
  start: async (data: { subjectId: number; groupId?: number; sessionType: "PERSONAL" | "GROUP" }) => {
    const response = await axiosInstance.post<StudySession>("/study-sessions/start", data);
    return response.data;
  },
  stop: async (id: number, status?: "COMPLETED" | "STOPPED") => {
    const response = await axiosInstance.post<StudySession>(`/study-sessions/${id}/stop`, { status });
    return response.data;
  },
  getAll: async () => {
    const response = await axiosInstance.get<StudySession[]>("/study-sessions");
    return response.data;
  },
};

export const analyticsApi = {
  getDaily: async () => {
    const response = await axiosInstance.get<DailyAnalytics>("/analytics/daily");
    return response.data;
  },
  getWeekly: async () => {
    const response = await axiosInstance.get<WeeklyAnalytics>("/analytics/weekly");
    return response.data;
  },
  getSubjects: async () => {
    const response = await axiosInstance.get<SubjectAnalytics[]>("/analytics/subjects");
    return response.data;
  },
};
