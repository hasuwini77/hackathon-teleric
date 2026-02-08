"use client";

import { BookOpen, Clock, BarChart3 } from "lucide-react";

const courses = [
  {
    title: "React Fundamentals",
    duration: "8 hours",
    level: "Beginner",
    color: "#14d9f5",
  },
  {
    title: "TypeScript Deep Dive",
    duration: "12 hours",
    level: "Intermediate",
    color: "#ffb347",
  },
  {
    title: "Next.js 15 Mastery",
    duration: "10 hours",
    level: "Advanced",
    color: "#14d9f5",
  },
];

export default function SuggestedCourses() {
  return (
    <div>
      <h3 className="font-bold text-sm mb-4" style={{ color: "var(--color-foreground)" }}>
        Suggested for You
      </h3>
      <div className="space-y-3">
        {courses.map((course, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${course.color}20` }}
              >
                <BookOpen className="w-5 h-5" style={{ color: course.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--color-foreground)" }}>
                  {course.title}
                </h4>
                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {course.level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
