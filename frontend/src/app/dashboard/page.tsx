"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ProgressBar } from "@/components/ProgressBar";
import { analyticsApi, groupsApi } from "@/lib/api";
import { DailyAnalytics, WeeklyAnalytics, SubjectAnalytics, StudyGroup } from "@/types";
import { GroupCard } from "@/components/GroupCard";
import { Flame, Clock, Target, BookOpen, PlusCircle, PlayCircle } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const [daily, setDaily] = useState<DailyAnalytics | null>(null);
  const [weekly, setWeekly] = useState<WeeklyAnalytics | null>(null);
  const [subjects, setSubjects] = useState<SubjectAnalytics[]>([]);
  const [userGroups, setUserGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [dailyData, weeklyData, subjectsData, groupsData] = await Promise.all([
          analyticsApi.getDaily(),
          analyticsApi.getWeekly(),
          analyticsApi.getSubjects(),
          groupsApi.search(),
        ]);
        setDaily(dailyData);
        setWeekly(weeklyData);
        setSubjects(subjectsData);

        if (user) {
          const myGroups = groupsData.filter((g) => g.members?.some((m) => m.user.id === user.id && m.status === "JOINED"));
          setUserGroups(myGroups);
        }
      } catch (err) {
        console.error("Failed to load dashboard analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  const goalProgress = daily ? (daily.totalMinutesStudied / daily.dailyGoalMinutes) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Welcome back, {user?.name || "Student"}!</h1>
              <p className="text-xs text-slate-400 mt-1">Here is your study consistency & focus summary for today.</p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/tracker"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
              >
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                Solo Focus Timer
              </Link>
              <Link
                href="/groups/create"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/30"
              >
                <PlusCircle className="w-4 h-4" />
                Create Group
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500 text-sm">Loading focus analytics...</div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Today Focus Time */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Today&apos;s Focus Time</span>
                    <Clock className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100 mb-1">{daily?.totalMinutesStudied || 0} mins</div>
                  <p className="text-[11px] text-slate-400 mb-3">Goal: {daily?.dailyGoalMinutes || 120} mins/day</p>
                  <ProgressBar value={goalProgress} colorHex="#6366F1" />
                </div>

                {/* Streak */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Current Streak</span>
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-400 mb-1">{daily?.currentStreakDays || 0} Days</div>
                  <p className="text-[11px] text-slate-400">Keep study consistency every day!</p>
                </div>

                {/* Completed Sessions */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Completed Sessions</span>
                    <Target className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100 mb-1">{daily?.completedSessionsCount || 0}</div>
                  <p className="text-[11px] text-slate-400">Finished Pomodoro sessions today</p>
                </div>

                {/* Weekly Total */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Weekly Total</span>
                    <BookOpen className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100 mb-1">{weekly?.totalMinutesThisWeek || 0} mins</div>
                  <p className="text-[11px] text-slate-400">Past 7 days aggregated focus</p>
                </div>
              </div>

              {/* Main Section: Weekly Chart & Subject Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Weekly Focus Bar Chart */}
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-base font-bold text-slate-200 mb-1">Past 7 Days Study Trend</h3>
                  <p className="text-xs text-slate-400 mb-6">Daily minutes spent across all subjects</p>

                  <div className="h-64 w-full">
                    {weekly && weekly.dailyBreakdown ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weekly.dailyBreakdown}>
                          <XAxis dataKey="dayOfWeek" stroke="#64748b" fontSize={12} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem" }}
                            labelStyle={{ color: "#f8fafc", fontWeight: "bold" }}
                          />
                          <Bar dataKey="minutesStudied" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500">No chart data yet</div>
                    )}
                  </div>
                </div>

                {/* Subject Breakdown */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-200 mb-1">Subject Breakdown</h3>
                    <p className="text-xs text-slate-400 mb-6">Time distribution per subject</p>

                    {subjects.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No study sessions recorded yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {subjects.map((sub) => (
                          <div key={sub.subjectId}>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-semibold text-slate-200 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.colorHex }} />
                                {sub.subjectName}
                              </span>
                              <span className="text-slate-400 font-mono">
                                {sub.totalMinutesStudied}m ({sub.percentage}%)
                              </span>
                            </div>
                            <ProgressBar value={sub.percentage} colorHex={sub.colorHex} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link href="/tracker" className="mt-6 text-xs text-center text-indigo-400 hover:underline font-semibold block">
                    View Complete Session History →
                  </Link>
                </div>
              </div>

              {/* My Active Study Groups */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-200">My Study Circles ({userGroups.length})</h2>
                  <Link href="/groups" className="text-xs text-indigo-400 hover:underline font-semibold">
                    Browse All Groups →
                  </Link>
                </div>

                {userGroups.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 mb-3">You have not joined any study groups yet.</p>
                    <Link
                      href="/groups"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold inline-block transition"
                    >
                      Find Study Groups
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userGroups.map((group) => (
                      <GroupCard key={group.id} group={group} currentUserId={user?.id} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
