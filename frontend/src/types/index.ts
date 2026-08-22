export interface Subject {
  id: number;
  name: string;
  colorHex: string;
  icon?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string;
  dailyGoalMinutes: number;
  bio?: string;
  subjects: Subject[];
  createdAt: string;
}

export type GroupSessionType = "FOCUS" | "POMODORO" | "CUSTOM";
export type GroupStatus = "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type MemberRole = "HOST" | "MEMBER";
export type MemberStatus = "JOINED" | "LEFT" | "KICKED";

export interface GroupMember {
  id: number;
  user: User;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
}

export interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  subject: Subject;
  creator: User;
  sessionType: GroupSessionType;
  startTime: string;
  durationMinutes: number;
  breakDurationMinutes: number;
  maxMembers: number;
  currentMembersCount: number;
  status: GroupStatus;
  members: GroupMember[];
  createdAt: string;
}

export type StudySessionType = "PERSONAL" | "GROUP";
export type StudySessionStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "STOPPED";

export interface StudySession {
  id: number;
  user: User;
  subject: Subject;
  groupId?: number;
  groupName?: string;
  sessionType: StudySessionType;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  status: StudySessionStatus;
  createdAt: string;
}

export interface RoomMessage {
  id: number;
  groupId: number;
  user: User;
  message: string;
  sentDuring: "BREAK";
  createdAt: string;
}

export interface DailyAnalytics {
  date: string;
  totalMinutesStudied: number;
  dailyGoalMinutes: number;
  completedSessionsCount: number;
  currentStreakDays: number;
}

export interface WeeklyBreakdown {
  dayOfWeek: string;
  date: string;
  minutesStudied: number;
}

export interface WeeklyAnalytics {
  startDate: string;
  endDate: string;
  totalMinutesThisWeek: number;
  dailyBreakdown: WeeklyBreakdown[];
}

export interface SubjectAnalytics {
  subjectId: number;
  subjectName: string;
  colorHex: string;
  totalMinutesStudied: number;
  percentage: number;
}

export interface FocusRoomState {
  groupId: number;
  phase: "FOCUS" | "BREAK";
  status: "SCHEDULED" | "ACTIVE" | "PAUSED" | "COMPLETED";
  phaseStartTime: number;
  phaseEndTime: number;
  remainingDurationMs: number;
  durationMinutes: number;
  breakDurationMinutes: number;
  hostUserId: number;
  activeParticipants: {
    userId: number;
    name: string;
    profileImageUrl?: string;
    isHost: boolean;
  }[];
}
