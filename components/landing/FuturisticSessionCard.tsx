"use client";

import React from "react";
import { type SessionSummary } from "@/lib/session-store";
import { ArrowRight, Clock, Star } from "lucide-react";

interface FuturisticSessionCardProps {
  session: SessionSummary;
  theme: "dark" | "light";
  onClick: (id: string) => void;
}

const FuturisticSessionCard: React.FC<FuturisticSessionCardProps> = ({ session, theme, onClick }) => {
  const isDark = theme === "dark";

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={() => onClick(session.sessionId)}
      className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-500 border overflow-hidden ${
        isDark 
          ? "bg-slate-900/40 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/60" 
          : "bg-white/40 border-slate-200 hover:border-blue-400/50 hover:bg-white/60"
      } backdrop-blur-md`}
    >
      {/* Hover glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${isDark ? "from-blue-600/20 to-purple-600/20" : "from-blue-400/10 to-purple-400/10"} opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10`} />

      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isDark ? "bg-blue-500/10" : "bg-blue-100"}`}>
              {session.learningPathCreated ? (
                <Star className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              ) : (
                <Clock className={`w-4 h-4 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
              )}
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {session.learningPathCreated ? "Active Mission" : "In Progress"}
            </span>
          </div>
          <span className={`text-[10px] font-medium ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            {formatDate(session.updatedAt)}
          </span>
        </div>

        <h3 className={`text-sm font-bold tracking-tight leading-snug line-clamp-2 ${isDark ? "text-white" : "text-slate-900"}`}>
          {session.objective || "Untitled Learning Path"}
        </h3>

        {session.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {session.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className={`text-[9px] px-2 py-0.5 rounded-full border ${
                  isDark 
                    ? "bg-slate-950/50 border-slate-800 text-slate-400" 
                    : "bg-slate-50 border-slate-100 text-slate-600"
                }`}
              >
                {skill}
              </span>
            ))}
            {session.skills.length > 3 && (
              <span className={`text-[9px] font-bold ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                +{session.skills.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="pt-2 flex items-center justify-between mt-auto">
          <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${
            isDark ? "text-blue-400 group-hover:text-blue-300" : "text-blue-600 group-hover:text-blue-500"
          }`}>
            Resume
          </span>
          <ArrowRight className={`w-3 h-3 transition-transform duration-300 group-hover:translate-x-1 ${
            isDark ? "text-blue-500" : "text-blue-400"
          }`} />
        </div>
      </div>
    </div>
  );
};

export default FuturisticSessionCard;
