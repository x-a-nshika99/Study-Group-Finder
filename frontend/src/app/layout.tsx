import "./globals.css";
import React from "react";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "StudyCircle — Server-Authoritative Study Group & Focus Tracker",
  description: "Subject-wise study group finder and distraction-free Pomodoro focus room",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
