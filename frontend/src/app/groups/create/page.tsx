"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { groupsApi, subjectsApi } from "@/lib/api";
import { Subject } from "@/types";
import { PlusCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const createGroupSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(120),
  description: z.string().max(500).optional(),
  subjectId: z.coerce.number().min(1, { message: "Subject selection is required" }),
  sessionType: z.enum(["FOCUS", "POMODORO", "CUSTOM"]),
  startTime: z.string().min(1, { message: "Start time is required" }),
  durationMinutes: z.coerce.number().min(5, { message: "Duration must be at least 5 minutes" }),
  breakDurationMinutes: z.coerce.number().min(1, { message: "Break duration must be at least 1 minute" }),
  maxMembers: z.coerce.number().min(2, { message: "Max members must be at least 2" }).max(50),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

export default function CreateGroupPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    subjectsApi.getAll().then(setSubjects).catch(console.error);
  }, []);

  const defaultStartTime = new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      sessionType: "POMODORO",
      durationMinutes: 25,
      breakDurationMinutes: 5,
      maxMembers: 8,
      startTime: defaultStartTime,
    },
  });

  const onSubmit = async (data: CreateGroupFormValues) => {
    try {
      setServerError(null);
      const newGroup = await groupsApi.create({
        ...data,
        startTime: new Date(data.startTime).toISOString(),
      });
      router.push(`/focus/${newGroup.id}`);
    } catch (err: any) {
      if (err.response && err.response.data) {
        const dataErr = err.response.data;
        if (dataErr.validationErrors) {
          Object.keys(dataErr.validationErrors).forEach((field) => {
            setError(field as any, { message: dataErr.validationErrors[field] });
          });
        } else if (dataErr.message) {
          setServerError(dataErr.message);
        }
      } else {
        setServerError("Failed to create study group.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/groups"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Create a Study Circle</h1>
              <p className="text-xs text-slate-400 mt-1">Host a server-authoritative synchronized Pomodoro session.</p>
            </div>
          </div>

          {serverError && (
            <div className="mb-6 p-3.5 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Group Title</label>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Organic Chemistry Final Exam Prep"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
              />
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description (Optional)</label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="What topics will you cover during this session?"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
              />
              {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</label>
                <select
                  {...register("subjectId")}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                >
                  <option value="">Select a Subject...</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {errors.subjectId && <p className="text-xs text-rose-400 mt-1">{errors.subjectId.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Session Pattern</label>
                <select
                  {...register("sessionType")}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                >
                  <option value="POMODORO">POMODORO (Standard 25/5m)</option>
                  <option value="FOCUS">FOCUS (Long uninterrupted)</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
                {errors.sessionType && <p className="text-xs text-rose-400 mt-1">{errors.sessionType.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Scheduled Start</label>
                <input
                  type="datetime-local"
                  {...register("startTime")}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none transition"
                />
                {errors.startTime && <p className="text-xs text-rose-400 mt-1">{errors.startTime.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Focus Duration (mins)</label>
                <input
                  type="number"
                  {...register("durationMinutes")}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none transition"
                />
                {errors.durationMinutes && <p className="text-xs text-rose-400 mt-1">{errors.durationMinutes.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Break Duration (mins)</label>
                <input
                  type="number"
                  {...register("breakDurationMinutes")}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none transition"
                />
                {errors.breakDurationMinutes && <p className="text-xs text-rose-400 mt-1">{errors.breakDurationMinutes.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Maximum Members (Capacity)</label>
              <input
                type="number"
                {...register("maxMembers")}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition"
              />
              {errors.maxMembers && <p className="text-xs text-rose-400 mt-1">{errors.maxMembers.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:bg-slate-800"
            >
              <PlusCircle className="w-4 h-4" />
              {isSubmitting ? "Creating Group..." : "Create & Launch Focus Room"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
