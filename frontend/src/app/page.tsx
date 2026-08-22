import Link from "next/link";
import { BookOpen, ShieldCheck, Users, Flame, Clock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="h-20 border-b border-slate-900 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-100">StudyCircle</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2">
            Log In
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-20 text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-950/80 border border-indigo-800/80 rounded-full text-indigo-400 text-xs font-semibold mb-8">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          Server-Authoritative Pomodoro & Zero Distractions
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 mb-6 leading-tight max-w-4xl">
          Subject-wise Study Groups & <br className="hidden sm:inline" />
          <span className="text-indigo-400">Distraction-Free Focus Rooms</span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Find peers studying your subjects, join synchronized study rooms, and build study consistency with server-backed timers. No feed, no notifications, break-only chat.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/register"
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-base transition shadow-xl shadow-indigo-600/30"
          >
            Join a Study Circle
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-semibold text-base transition"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-2">Server-Authoritative Timer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The backend owns timer start/end times. Refreshing or lagging client clocks never desync room timers.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-2">Break-Only Messaging</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chat is completely locked during focus sessions and only unlocks during break state, enforced by the backend.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center mb-4">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-2">Subject & Streak Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track daily focus minutes vs your goal, view weekly charts, and maintain consistent daily study streaks.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        StudyCircle — Distraction-Free Synchronized Study Tracker
      </footer>
    </div>
  );
}
