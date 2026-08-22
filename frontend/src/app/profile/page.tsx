"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { usersApi, subjectsApi } from "@/lib/api";
import { Subject } from "@/types";
import { User as UserIcon, Check, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, refetchUser } = useAuth();
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(120);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    subjectsApi.getAll().then(setAllSubjects).catch(console.error);
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setDailyGoalMinutes(user.dailyGoalMinutes || 120);
      setProfileImageUrl(user.profileImageUrl || "");
      if (user.subjects) {
        setSelectedSubjectIds(user.subjects.map((s) => s.id));
      }
    }
  }, [user]);

  const toggleSubject = (id: number) => {
    setSelectedSubjectIds((prev) => (prev.includes(id) ? prev.filter((subId) => subId !== id) : [...prev, id]));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await usersApi.updateProfile({
        name,
        bio,
        dailyGoalMinutes: Number(dailyGoalMinutes),
        profileImageUrl,
      });
      await usersApi.updateSubjects(selectedSubjectIds);
      await refetchUser();
      setSavedMessage("Profile and subject preferences saved successfully!");
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-100">My Profile Settings</h1>
            <p className="text-xs text-slate-400 mt-1">Manage your daily goal, bio, and enrolled subject interests.</p>
          </div>

          {savedMessage && (
            <div className="mb-6 p-3.5 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{savedMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* Account Details */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-400" /> Account Details
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell study partners about your goals..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Daily Goal (Minutes)</label>
                  <input
                    type="number"
                    value={dailyGoalMinutes}
                    onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Profile Image URL</label>
                  <input
                    type="text"
                    value={profileImageUrl}
                    onChange={(e) => setProfileImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Subject Selection */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-sm font-bold text-slate-200 mb-1">Enrolled Subjects</h2>
              <p className="text-xs text-slate-400 mb-4">Select subjects you study regularly to personalize group recommendations.</p>

              <div className="flex flex-wrap gap-2.5">
                {allSubjects.map((sub) => {
                  const isSelected = selectedSubjectIds.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleSubject(sub.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-2 ${
                        isSelected
                          ? "bg-indigo-950 text-indigo-200 border-indigo-700"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.colorHex }} />
                      {sub.name}
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:bg-slate-800"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save Profile & Preferences"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
