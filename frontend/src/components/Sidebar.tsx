"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, PlusCircle, Timer, User, BookOpen } from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Find Groups", href: "/groups", icon: Users },
    { label: "Create Group", href: "/groups/create", icon: PlusCircle },
    { label: "Solo Tracker", href: "/tracker", icon: Timer },
    { label: "My Profile", href: "/profile", icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          Focus Rule
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Focus sessions are zero-distraction. Chat unlocks only during break intervals.
        </p>
      </div>
    </aside>
  );
};
