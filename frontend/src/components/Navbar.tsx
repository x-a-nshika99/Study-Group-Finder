"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Flame, LogOut, User as UserIcon, BookOpen } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100">StudyCircle</span>
        </Link>
      </div>

      {user ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/60 border border-amber-800/60 rounded-full text-amber-400 text-xs font-semibold">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Active Study Member</span>
          </div>

          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <Link href="/profile" className="flex items-center gap-2 text-slate-300 hover:text-white transition">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-semibold">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-sm font-medium hidden md:inline">{user.name}</span>
            </Link>

            <button
              onClick={() => logout()}
              title="Logout"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-300 hover:text-white font-medium px-3 py-1.5">
            Log In
          </Link>
          <Link
            href="/register"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-1.5 rounded-lg transition shadow-md shadow-indigo-600/20"
          >
            Sign Up
          </Link>
        </div>
      )}
    </header>
  );
};
