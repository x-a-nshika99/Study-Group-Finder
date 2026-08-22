"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { SubjectBadge } from "@/components/SubjectBadge";
import { sessionsApi, subjectsApi } from "@/lib/api";
import { StudySession, Subject } from "@/types";
import { formatSecondsToMMSS, formatDate, formatTime } from "@/lib/utils";
import { Play, Square, Timer, History, Calendar } from "lucide-react";

export default function SoloTrackerPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    subjectsApi.getAll().then((data) => {
      setSubjects(data);
      if (data.length > 0) setSelectedSubjectId(data[0].id);
    });
    loadSessions();
  }, []);

  const loadSessions = () => {
    sessionsApi.getAll().then((data) => {
      setSessions(data);
      const running = data.find((s) => s.status === "ACTIVE");
      if (running) {
        setActiveSession(running);
      }
    });
  };

  // Solo timer ticker
  useEffect(() => {
    let interval: any = null;
    if (activeSession) {
      const startTimeMs = new Date(activeSession.startTime).getTime();
      interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((now - startTimeMs) / 1000));
        setElapsedSeconds(diff);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStartSolo = async () => {
    if (!selectedSubjectId) return;
    try {
      const newSession = await sessionsApi.start({
        subjectId: selectedSubjectId,
        sessionType: "PERSONAL",
      });
      setActiveSession(newSession);
      loadSessions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopSolo = async () => {
    if (!activeSession) return;
    try {
      await sessionsApi.stop(activeSession.id, "COMPLETED");
      setActiveSession(null);
      loadSessions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-100">Solo Study Tracker</h1>
            <p className="text-xs text-slate-400 mt-1">Track individual focus sessions and build continuous subject hours.</p>
          </div>

          {/* Active Solo Timer Widget */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl mb-12 flex flex-col items-center justify-center text-center shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {activeSession ? "Solo Focus Session Active" : "Start New Solo Session"}
              </span>
            </div>

            {activeSession ? (
              <>
                <div className="mb-3">
                  <SubjectBadge subject={activeSession.subject} />
                </div>
                <div className="text-7xl font-mono font-bold text-indigo-400 my-4 tracking-tight">
                  {formatSecondsToMMSS(elapsedSeconds)}
                </div>
                <button
                  onClick={handleStopSolo}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-rose-600/30"
                >
                  <Square className="w-4 h-4 fill-white" /> Complete Session
                </button>
              </>
            ) : (
              <div className="w-full max-w-sm space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 text-left">Select Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleStartSolo}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30"
                >
                  <Play className="w-4 h-4 fill-white" /> Start Solo Focus Session
                </button>
              </div>
            )}
          </div>

          {/* Session History Table */}
          <div>
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Session History
            </h2>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="divide-y divide-slate-800">
                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">No past study sessions found.</div>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition">
                      <div className="flex items-center gap-4">
                        <SubjectBadge subject={session.subject} size="sm" />
                        <div>
                          <div className="text-xs font-bold text-slate-200">
                            {session.groupName ? `Group: ${session.groupName}` : "Solo Session"}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {formatDate(session.startTime)}
                            </span>
                            <span>• {formatTime(session.startTime)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-slate-200">
                          {session.durationMinutes ? `${session.durationMinutes} mins` : "Active"}
                        </div>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
