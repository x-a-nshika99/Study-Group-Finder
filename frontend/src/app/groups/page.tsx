"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { GroupCard } from "@/components/GroupCard";
import { groupsApi, subjectsApi } from "@/lib/api";
import { StudyGroup, Subject } from "@/types";
import { Search, Filter, PlusCircle, BookOpen } from "lucide-react";
import Link from "next/link";

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedSubjectId) params.subjectId = Number(selectedSubjectId);
      if (selectedStatus) params.status = selectedStatus;

      const data = await groupsApi.search(params);
      setGroups(data);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    subjectsApi.getAll().then(setSubjects).catch(console.error);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [selectedSubjectId, selectedStatus]);

  const handleJoinGroup = async (groupId: number) => {
    try {
      await groupsApi.join(groupId);
      await fetchGroups();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to join group");
    }
  };

  const handleLeaveGroup = async (groupId: number) => {
    try {
      await groupsApi.leave(groupId);
      await fetchGroups();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to leave group");
    }
  };

  const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Find Study Circles</h1>
              <p className="text-xs text-slate-400 mt-1">
                Filter study groups by subject, availability, and session schedule.
              </p>
            </div>

            <Link
              href="/groups/create"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/30 self-start"
            >
              <PlusCircle className="w-4 h-4" />
              Create New Group
            </Link>
          </div>

          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search group name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Subject Filter */}
            <div className="relative">
              <Filter className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          {/* Groups Listing */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-sm">Loading available study circles...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 p-12 rounded-2xl text-center max-w-lg mx-auto">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300 mb-1">No Study Groups Found</h3>
              <p className="text-xs text-slate-400 mb-6">No study groups match your selected filters. Create one!</p>
              <Link
                href="/groups/create"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold inline-block transition"
              >
                Create Study Group
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  currentUserId={user?.id}
                  onJoin={handleJoinGroup}
                  onLeave={handleLeaveGroup}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
