import React from "react";
import { StudyGroup } from "@/types";
import { SubjectBadge } from "./SubjectBadge";
import { formatDate, formatTime } from "@/lib/utils";
import { Users, Clock, PlayCircle } from "lucide-react";
import Link from "next/link";

interface GroupCardProps {
  group: StudyGroup;
  currentUserId?: number;
  onJoin?: (groupId: number) => void;
  onLeave?: (groupId: number) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, currentUserId, onJoin, onLeave }) => {
  const isMember = group.members?.some((m) => m.user.id === currentUserId && m.status === "JOINED");
  const isHost = group.creator.id === currentUserId;
  const isFull = group.currentMembersCount >= group.maxMembers;

  const statusColors = {
    SCHEDULED: "bg-slate-700 text-slate-300",
    ACTIVE: "bg-emerald-950 text-emerald-300 border border-emerald-800",
    COMPLETED: "bg-blue-950 text-blue-300 border border-blue-800",
    CANCELLED: "bg-rose-950 text-rose-300 border border-rose-800",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex items-center justify-between mb-3">
          <SubjectBadge subject={group.subject} />
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${statusColors[group.status]}`}>
            {group.status}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-100 mb-1 line-clamp-1">{group.name}</h3>
        {group.description && <p className="text-sm text-slate-400 mb-4 line-clamp-2">{group.description}</p>}

        <div className="space-y-2 text-xs text-slate-400 mb-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Start Time:
            </span>
            <span className="font-medium text-slate-200">
              {formatDate(group.startTime)} at {formatTime(group.startTime)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Duration:</span>
            <span className="font-medium text-slate-200">{group.durationMinutes} mins ({group.breakDurationMinutes}m break)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Members:
            </span>
            <span className="font-medium text-slate-200">
              {group.currentMembersCount} / {group.maxMembers} {isFull ? "(Full)" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Host: <span className="text-slate-300 font-medium">{group.creator.name}</span>
        </div>

        <div className="flex gap-2">
          {isMember ? (
            <Link
              href={`/focus/${group.id}`}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Enter Room
            </Link>
          ) : (
            <button
              disabled={isFull || group.status === "COMPLETED" || group.status === "CANCELLED"}
              onClick={() => onJoin && onJoin(group.id)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold transition"
            >
              {isFull ? "Group Full" : "Join Group"}
            </button>
          )}

          {isMember && !isHost && onLeave && (
            <button
              onClick={() => onLeave(group.id)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 rounded-lg text-xs font-medium transition"
            >
              Leave
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
