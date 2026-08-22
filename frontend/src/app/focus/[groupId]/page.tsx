"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { groupsApi } from "@/lib/api";
import { StudyGroup } from "@/types";
import { NightOwlStudyRoom } from "@/components/NightOwlStudyRoom";

export default function FocusRoomPage() {
  const params = useParams();
  const groupId = Number(params?.groupId);
  const { user, loading: authLoading } = useAuth();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    groupsApi
      .getById(groupId)
      .then((data) => {
        setGroup(data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load study group room.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [groupId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-sm font-medium">
        Connecting to NightOwl Focus Room...
      </div>
    );
  }

  if (error || !group || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Unable to Access Room</h2>
        <p className="text-xs text-slate-400 mb-6">{error || "Group room not found"}</p>
        <a href="/groups" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Return to Groups
        </a>
      </div>
    );
  }

  return <NightOwlStudyRoom group={group} currentUserId={user.id} />;
}
