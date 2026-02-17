"use client";

import { useState } from "react";
import { Target, GraduationCap, Users, Upload, Linkedin, MessageSquare, Mic } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onRoleSelect: (role: string) => void;
}

const colorStyles = {
  indigo: "bg-indigo-500/20 text-indigo-400",
  blue: "bg-blue-500/20 text-blue-400",
  violet: "bg-violet-500/20 text-violet-400"
};

const scenarios = [
  {
    id: "career",
    icon: Target,
    title: "Career move",
    description: "Transition to a new role",
    color: "indigo"
  },
  {
    id: "upskill",
    icon: GraduationCap,
    title: "Upskill in a new area",
    description: "Develop expertise in emerging technologies",
    color: "blue"
  },
  {
    id: "training",
    icon: Users,
    title: "Prepare for training",
    description: "Get ready for meetings or presentations",
    color: "violet"
  }
];

const intakeOptions = [
//   { id: "cv", icon: Upload, label: "Upload CV" },
//   { id: "linkedin", icon: Linkedin, label: "Connect LinkedIn" },
  { id: "chat", icon: MessageSquare, label: "Chat interview" },
//   { id: "voice", icon: Mic, label: "Voice interview" }
];

export function LandingPage({ onRoleSelect }: LandingPageProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="w-full max-w-5xl">

        {/* Branding */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-semibold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            SKYE
          </h1>
          <p className="text-slate-400 mt-2">Navigate your learning journey with clarity</p>
        </div>

        {/* Main Question */}
        <h2 className="text-3xl md:text-4xl font-light text-white mb-12 text-center">
          What would you like to do today?
        </h2>

        {/* Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            const active = selectedScenario === scenario.id;

            return (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-6 rounded-2xl border transition-all text-left
                  ${active 
                    ? "border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorStyles[scenario.color as keyof typeof colorStyles]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-medium">{scenario.title}</h3>
                    <p className="text-slate-400 text-sm mt-1">{scenario.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        {selectedScenario && (
          <div className="text-center mb-14">
            <button
              onClick={() => onRoleSelect("Cloud Engineer")}
              className="px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition"
            >
              Continue
            </button>
          </div>
        )}

        {/* Intake Options */}
        <div className="text-center">
          <h3 className="text-lg text-slate-300 mb-6">Or let SKYE get to know you</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {intakeOptions.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  key={option.id}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <Icon className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm text-slate-300">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Page() {
  return <LandingPage onRoleSelect={() => {}} />;
}
