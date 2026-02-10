"use client";

import { useState } from "react";
import { User, Briefcase, Target, Plus, X, ChevronLeft, Sparkles } from "lucide-react";

export interface UserProfile {
  skills: string[];
  experience: string;
  goals: string;
  linkedinSummary: string;
}

interface ProfilePanelProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  isOpen: boolean;
  onToggle: () => void;
  onDigest: () => void;
  isDigesting: boolean;
}

export default function ProfilePanel({
  profile,
  onProfileChange,
  isOpen,
  onToggle,
  onDigest,
  isDigesting,
}: ProfilePanelProps) {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      onProfileChange({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    onProfileChange({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    });
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-full shadow-lg"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-primary-foreground)",
        }}
      >
        <ChevronLeft className={`w-5 h-5 transition-transform ${isOpen ? "" : "rotate-180"}`} />
      </button>

      {/* Panel */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative z-40 lg:z-0 w-80 border-r transition-transform duration-300 flex flex-col h-full`}
        style={{
          backgroundColor: "var(--color-background)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            <h2 className="font-bold text-base tracking-tight" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)", lineHeight: "1.2" }}>
              Your Profile
            </h2>
          </div>
          <p className="text-xs mb-5" style={{ color: "var(--color-muted-foreground)", lineHeight: "1.5" }}>
            Build your personalized learning journey
          </p>
          
          <button
            onClick={onDigest}
            disabled={isDigesting}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
             style={{
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
              color: "var(--color-primary-foreground)",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
            }}
          >
            {isDigesting ? (
                <>
                <Sparkles className="w-4 h-4 animate-spin"/>
                Analyzing Profile...
                </>
            ) : (
                <>
                <Sparkles className="w-4 h-4"/>
                Generate Recommendations
                </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Skills */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
              <label className="text-sm font-semibold" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)" }}>
                Skills
              </label>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add a skill..."
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              />
              <button
                onClick={addSkill}
                className="p-2.5 rounded-xl transition-all hover:scale-105"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-primary-foreground)",
                }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 text-xs rounded-lg flex items-center gap-2 border transition-all hover:scale-105"
                  style={{
                    backgroundColor: "rgba(139, 92, 246, 0.08)",
                    borderColor: "rgba(139, 92, 246, 0.2)",
                    color: "var(--color-foreground)",
                  }}
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:opacity-70 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
              <label className="text-sm font-semibold" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)" }}>
                Experience Level
              </label>
            </div>
            <select
              value={profile.experience}
              onChange={(e) => onProfileChange({ ...profile, experience: e.target.value })}
              className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-foreground)",
              }}
            >
              <option value="">Select level...</option>
              <option value="beginner">Beginner (0-1 years)</option>
              <option value="intermediate">Intermediate (1-3 years)</option>
              <option value="advanced">Advanced (3-5 years)</option>
              <option value="expert">Expert (5+ years)</option>
            </select>
          </div>

          {/* Goals */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
              <label className="text-sm font-semibold" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)" }}>
                Learning Goals
              </label>
            </div>
            <textarea
              value={profile.goals}
              onChange={(e) => onProfileChange({ ...profile, goals: e.target.value })}
              placeholder="What do you want to achieve?"
              rows={4}
              className="w-full px-4 py-3 text-sm rounded-xl border outline-none focus:ring-2 resize-none transition-all"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-foreground)",
                lineHeight: "1.5",
              }}
            />
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
}
