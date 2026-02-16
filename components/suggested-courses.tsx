"use client";

import { BookOpen, Clock, BarChart3 } from "lucide-react";

const courses = [
  {
    title: "React Fundamentals",
    duration: "8 hours",
    level: "Beginner",
  },
  {
    title: "TypeScript Deep Dive",
    duration: "12 hours",
    level: "Intermediate",
  },
  {
    title: "Next.js 15 Mastery",
    duration: "10 hours",
    level: "Advanced",
  },
];

export default function SuggestedCourses() {
  return (
    <div>
      <h3 className="font-bold text-base mb-5 tracking-tight" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)", lineHeight: "1.2" }}>
        Suggested for You
      </h3>
      <div className="space-y-4">
        {courses.map((course, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer group"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
              >
                <BookOpen className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-2 tracking-tight" style={{ color: "var(--color-foreground)", lineHeight: "1.3" }}>
                  {course.title}
                </h4>
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
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
