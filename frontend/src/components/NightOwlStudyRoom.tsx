"use client";

import React, { useEffect, useState, useRef } from "react";
import { StudyGroup, FocusRoomState, RoomMessage } from "@/types";
import { getSocket } from "@/lib/socketClient";
import { formatSecondsToMMSS } from "@/lib/utils";
import { SubjectBadge } from "./SubjectBadge";
import { groupsApi } from "@/lib/api";
import { Play, Pause, Square, Coffee, Send, Users, Shield, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface NightOwlStudyRoomProps {
  group: StudyGroup;
  currentUserId: number;
}

export const NightOwlStudyRoom: React.FC<NightOwlStudyRoomProps> = ({ group, currentUserId }) => {
  const [roomState, setRoomState] = useState<FocusRoomState | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(group.durationMinutes * 60);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [chatError, setChatError] = useState<string | null>(null);

  const socketRef = useRef(getSocket());
  const isHost = group.creator.id === currentUserId;

  // 1. Fetch past break chat history
  useEffect(() => {
    groupsApi.getMessages(group.id).then(setMessages).catch(console.error);
  }, [group.id]);

  // 2. Connect to Socket.IO & join room
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("JOIN_ROOM", { groupId: group.id, userId: currentUserId });

    socket.on("ROOM_STATE_SYNC", (state: FocusRoomState) => {
      setRoomState(state);
    });

    socket.on("FOCUS_STARTED", (state: FocusRoomState) => {
      setRoomState(state);
    });

    socket.on("BREAK_STARTED", (state: FocusRoomState) => {
      setRoomState(state);
    });

    socket.on("SESSION_PAUSED", (state: FocusRoomState) => {
      setRoomState(state);
    });

    socket.on("SESSION_RESUMED", (state: FocusRoomState) => {
      setRoomState(state);
    });

    socket.on("SESSION_COMPLETED", (state: FocusRoomState) => {
      setRoomState(state);
    });

    socket.on("PARTICIPANT_JOINED", (participants) => {
      setRoomState((prev) => (prev ? { ...prev, activeParticipants: participants } : prev));
    });

    socket.on("PARTICIPANT_LEFT", (participants) => {
      setRoomState((prev) => (prev ? { ...prev, activeParticipants: participants } : prev));
    });

    socket.on("ROOM_MESSAGE_RECEIVED", (msg: RoomMessage) => {
      setMessages((prev) => [...prev, msg]);
      setChatError(null);
    });

    socket.on("MESSAGE_ERROR", (errMsg: string) => {
      setChatError(errMsg);
    });

    return () => {
      socket.off("ROOM_STATE_SYNC");
      socket.off("FOCUS_STARTED");
      socket.off("BREAK_STARTED");
      socket.off("SESSION_PAUSED");
      socket.off("SESSION_RESUMED");
      socket.off("SESSION_COMPLETED");
      socket.off("PARTICIPANT_JOINED");
      socket.off("PARTICIPANT_LEFT");
      socket.off("ROOM_MESSAGE_RECEIVED");
      socket.off("MESSAGE_ERROR");
    };
  }, [group.id, currentUserId]);

  // 3. Server-authoritative timer ticker loop: remainingSeconds = (serverEndTime - browserNow)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!roomState) return;

      if (roomState.status === "PAUSED") {
        setRemainingSeconds(Math.max(0, Math.floor(roomState.remainingDurationMs / 1000)));
      } else if (roomState.status === "ACTIVE" && roomState.phaseEndTime > 0) {
        const now = Date.now();
        const diffMs = roomState.phaseEndTime - now;
        const secondsLeft = Math.max(0, Math.floor(diffMs / 1000));
        setRemainingSeconds(secondsLeft);
      } else {
        // Default initial readout
        setRemainingSeconds(roomState.durationMinutes * 60);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [roomState]);

  // Host control handlers
  const handleStartFocus = () => {
    socketRef.current.emit("START_FOCUS", { groupId: group.id, userId: currentUserId });
  };

  const handleStartBreak = () => {
    socketRef.current.emit("START_BREAK", { groupId: group.id, userId: currentUserId });
  };

  const handlePause = () => {
    socketRef.current.emit("PAUSE_SESSION", { groupId: group.id, userId: currentUserId });
  };

  const handleResume = () => {
    socketRef.current.emit("RESUME_SESSION", { groupId: group.id, userId: currentUserId });
  };

  const handleComplete = () => {
    socketRef.current.emit("COMPLETE_SESSION", { groupId: group.id, userId: currentUserId });
  };

  // Break-only chat send handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    if (!roomState || roomState.phase !== "BREAK") {
      setChatError("Messaging is locked during focus sessions!");
      return;
    }

    socketRef.current.emit("SEND_MESSAGE", {
      groupId: group.id,
      userId: currentUserId,
      message: messageInput.trim(),
    });
    setMessageInput("");
  };

  const isBreakPhase = roomState?.phase === "BREAK";
  const isFocusPhase = roomState?.phase === "FOCUS" || !roomState?.phase;
  const isPaused = roomState?.status === "PAUSED";
  const isActive = roomState?.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-900 px-6 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-4">
          <Link
            href="/groups"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-200 flex items-center gap-2">
              {group.name}
              <SubjectBadge subject={group.subject} size="sm" />
            </h1>
            <p className="text-xs text-slate-500">NightOwl Focus Room — Server Authoritative Session</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${
              isBreakPhase
                ? "bg-amber-950/80 text-amber-300 border-amber-800/80"
                : "bg-indigo-950/80 text-indigo-300 border-indigo-800/80"
            }`}
          >
            {isBreakPhase ? "☕ Break Phase" : "🎯 Focus Phase"}
          </span>
          <Link
            href="/groups"
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-800 transition"
          >
            Leave Room
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Center Focus Area */}
        <div className="lg:col-span-8 p-8 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-slate-900 bg-slate-950/40">
          {/* Phase Banner */}
          <div className="w-full max-w-lg text-center pt-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Current State</p>
            <h2 className="text-xl font-semibold text-slate-300">
              {isBreakPhase ? "Relax & Stretch — Break Time" : isFocusPhase ? "Deep Work — Zero Distractions" : "Scheduled"}
            </h2>
          </div>

          {/* Large Monospace Timer */}
          <div className="my-12 flex flex-col items-center">
            <div
              className={`text-7xl sm:text-8xl md:text-9xl font-mono font-bold tracking-tighter ${
                isBreakPhase ? "text-amber-400" : isPaused ? "text-slate-500" : "text-indigo-400"
              }`}
            >
              {formatSecondsToMMSS(remainingSeconds)}
            </div>
            <div className="mt-4 text-xs font-medium text-slate-500 tracking-wider uppercase">
              {isPaused ? "Timer Paused" : isActive ? "Synchronized Real-time Count" : "Ready to start"}
            </div>
          </div>

          {/* Host Controls */}
          {isHost ? (
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-center gap-3 shadow-xl">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 px-2 font-semibold">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Host Controls:
              </span>

              {!isActive && !isPaused && (
                <button
                  onClick={handleStartFocus}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-indigo-600/30"
                >
                  <Play className="w-4 h-4 fill-white" /> Start Focus Session
                </button>
              )}

              {isActive && (
                <button
                  onClick={handlePause}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
                >
                  <Pause className="w-4 h-4 fill-white" /> Pause Session
                </button>
              )}

              {isPaused && (
                <button
                  onClick={handleResume}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
                >
                  <Play className="w-4 h-4 fill-white" /> Resume Session
                </button>
              )}

              {isFocusPhase && isActive && (
                <button
                  onClick={handleStartBreak}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/60 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                >
                  <Coffee className="w-4 h-4" /> Switch to Break
                </button>
              )}

              {isBreakPhase && (
                <button
                  onClick={handleStartFocus}
                  className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                >
                  <Play className="w-4 h-4" /> Back to Focus
                </button>
              )}

              {(isActive || isPaused) && (
                <button
                  onClick={handleComplete}
                  className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                >
                  <Square className="w-4 h-4 fill-rose-300" /> End Session
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-900/60 px-4 py-2 rounded-full border border-slate-800">
              Host ({group.creator.name}) controls timer phases
            </div>
          )}

          {/* Body-doubling Participants Visual */}
          <div className="w-full max-w-xl mt-8 pt-6 border-t border-slate-900/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" /> Present Body Doublers ({roomState?.activeParticipants?.length || 0})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {roomState?.activeParticipants?.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-slate-200">{p.name}</span>
                  {p.isHost && <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950 px-1.5 py-0.5 rounded">HOST</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Break-Only Chat Panel */}
        <div className="lg:col-span-4 bg-slate-900/50 flex flex-col justify-between h-full border-l border-slate-900">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              Break Chat
              {isBreakPhase ? (
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-medium">
                  Unlocked
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Focus Locked
                </span>
              )}
            </h3>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[300px]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500 py-12">
                <Coffee className="w-8 h-8 mb-2 text-slate-700" />
                <p>No break messages yet.</p>
                <p className="mt-1 text-slate-600">Chat unlocks when host initiates a break.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-300">{msg.user.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{msg.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Message Input (Break-only) */}
          <div className="p-4 border-t border-slate-800 bg-slate-900">
            {chatError && <p className="text-xs text-rose-400 mb-2 font-medium">{chatError}</p>}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                disabled={!isBreakPhase}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={isBreakPhase ? "Type a quick break message..." : "Chat is locked during Focus phase..."}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:bg-slate-950/40 disabled:text-slate-600 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!isBreakPhase || !messageInput.trim()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
