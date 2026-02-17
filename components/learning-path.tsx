"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  PlayCircle, 
  FileText, 
  CheckCircle2, 
  Circle,
  ExternalLink,
  Download,
  Trophy
} from "lucide-react";
import { Progress } from "./ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LearningPath as LearningPathType, Course } from "@/lib/learning-path-types";
import { cn } from "@/lib/utils";

interface LearningPathProps {
  path: LearningPathType;
}

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "video": return <PlayCircle className="w-3.5 h-3.5" />;
    case "article": return <FileText className="w-3.5 h-3.5" />;
    case "documentation": return <BookOpen className="w-3.5 h-3.5" />;
    case "course": return <BookOpen className="w-3.5 h-3.5" />;
    default: return <BookOpen className="w-3.5 h-3.5" />;
  }
};

export default function LearningPathDisplay({ path }: LearningPathProps) {
  // Track completed course IDs
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const toggleComplete = (id: string) => {
    const newSet = new Set(completedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCompletedIds(newSet);
  };

  // Calculate stats
  const totalCourses = path.milestones.reduce((acc, m) => acc + m.courses.length, 0);
  const completedCount = completedIds.size;
  const progressPercent = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/20 space-y-3">
        <div>
          <h3 className="font-bold text-lg tracking-tight leading-tight">
            {path.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {path.description}
          </p>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Progress</span>
            <span className="font-bold text-primary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {path.milestones.map((milestone, mIdx) => (
            <div key={milestone.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {mIdx + 1}
                </div>
                <h4 className="font-semibold text-sm">{milestone.title}</h4>
              </div>

              <div className="space-y-2 pl-2">
                {milestone.courses.map((course, cIdx) => {
                  const isCompleted = completedIds.has(course.id);
                  return (
                    <div
                      key={course.id}
                      className={cn(
                        "group relative flex items-start gap-3 p-3 rounded-xl border bg-background transition-all hover:border-primary/40",
                        isCompleted && "opacity-60 bg-muted/50"
                      )}
                    >
                      <button 
                        onClick={() => toggleComplete(course.id)}
                        className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs font-medium leading-tight",
                            isCompleted && "line-through text-muted-foreground"
                          )}>
                            {course.title}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-md">
                            {getTypeIcon(course.type)}
                            <span className="uppercase">{course.type}</span>
                          </span>
                          <span>•</span>
                          <span>{course.duration}</span>
                        </div>
                      </div>

                      {course.url && (
                        <a 
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/20">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors">
          <Download className="w-4 h-4" />
          Save Learning Path
        </button>
      </div>
    </div>
  );
}