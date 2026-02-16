"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  PlayCircle, 
  FileText, 
  CheckCircle2, 
  Circle,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { Progress } from "./ui/progress";

export type ResourceType = "video" | "article" | "course" | "documentation";

export interface Resource {
  id: string;
  title: string;
  provider: string;
  type: ResourceType;
  duration: string;
  url: string;
  completed: boolean;
  step: number;
}

const DUMMY_RESOURCES: Resource[] = [
  {
    id: "1",
    title: "React Server Components Deep Dive",
    provider: "Official React Docs",
    type: "documentation",
    duration: "45 min",
    url: "#",
    completed: true,
    step: 1
  },
  {
    id: "2",
    title: "Next.js 15 App Router Architecture",
    provider: "Vercel Academy",
    type: "course",
    duration: "2 hours",
    url: "#",
    completed: false,
    step: 2
  },
  {
    id: "3",
    title: "Mastering Tailwind CSS Patterns",
    provider: "Frontend Masters",
    type: "video",
    duration: "1.5 hours",
    url: "#",
    completed: false,
    step: 3
  },
  {
    id: "4",
    title: "TypeScript Performance Audit",
    provider: "Medium",
    type: "article",
    duration: "15 min",
    url: "#",
    completed: false,
    step: 4
  }
];

const getTypeIcon = (type: ResourceType) => {
  switch (type) {
    case "video": return <PlayCircle className="w-4 h-4" />;
    case "article": return <FileText className="w-4 h-4" />;
    case "documentation": return <BookOpen className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
};

export default function LearningPath() {
  const [resources, setResources] = useState<Resource[]>(DUMMY_RESOURCES);

  const toggleComplete = (id: string) => {
    setResources(prev => prev.map(res => 
      res.id === id ? { ...res, completed: !res.completed } : res
    ));
  };

  const completedCount = resources.filter(r => r.completed).length;
  const progressPercent = Math.round((completedCount / resources.length) * 100);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg tracking-tight" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)" }}>
            Your Learning Mission
          </h3>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
            {progressPercent}% Complete
          </span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
        {resources.map((res) => (
          <div
            key={res.id}
            className={`p-4 rounded-2xl border transition-all duration-300 relative group ${
              res.completed ? "opacity-75" : "hover:border-primary/30"
            }`}
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: res.completed ? "var(--color-primary-low)" : "var(--color-border)",
            }}
          >
            <div className="flex items-start gap-3">
              <button 
                onClick={() => toggleComplete(res.id)}
                className="mt-1 transition-transform active:scale-90"
              >
                {res.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary/50 transition-colors" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Step {res.step}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                    {getTypeIcon(res.type)}
                    {res.type.toUpperCase()}
                  </div>
                </div>
                
                <h4 className={`font-semibold text-sm mb-1 tracking-tight leading-snug truncate ${
                  res.completed ? "line-through text-muted-foreground" : "text-foreground"
                }`}>
                  {res.title}
                </h4>
                
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="font-medium">{res.provider}</span>
                  <span>•</span>
                  <span>{res.duration}</span>
                </div>
              </div>

              <a 
                href={res.url}
                className="p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
            
            {!res.completed && (
              <div className="absolute top-0 right-0 p-2 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse opacity-50" />
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
