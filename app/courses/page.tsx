"use client";

import CourseSidebar from "@/components/course-sidebar";
import LearningPath from "@/components/learning-path";
import SuggestedCourses from "@/components/suggested-courses";
import {
  Play,
  Clock,
  BarChart3,
  Flame,
  Trophy,
  Star,
  ChevronRight,
  BookOpen,
  Layout,
  Layers,
  Zap
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function CoursesPage() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <CourseSidebar />

      <main className="flex-1 overflow-y-auto scrollbar-thin bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
        <div className="max-w-6xl mx-auto p-8 lg:p-12 space-y-12">

          {/* Hero Section */}
          <header className="relative p-10 rounded-[32px] border border-border bg-card overflow-hidden shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                    Current Focus
                  </Badge>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border px-3 py-1 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" /> 4 Day Streak
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight font-display leading-[1.1]">
                    Frontend Engineering <br />
                    <span className="text-primary">Mastery Path</span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                    A personalized journey tailored to your goal of becoming a Senior React Developer.
                    Building on your existing TypeScript knowledge.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-8 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">Time Spent</p>
                      <p className="text-lg font-bold">12.5h / 40h</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">Modules Done</p>
                      <p className="text-lg font-bold">3 / 10</p>
                    </div>
                  </div>
                </div>

                <button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold transition-all shadow-xl shadow-primary/20 flex items-center gap-3 group active:scale-95">
                  <Play className="w-5 h-5 fill-current" />
                  Continue Learning
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Progress Card */}
              <div className="w-full md:w-80 shrink-0 p-8 rounded-3xl border border-border bg-muted/60 backdrop-blur-xl space-y-6 shadow-xl">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-semibold text-foreground">Overall Progress</p>
                    <p className="text-3xl font-bold text-primary">32%</p>
                  </div>
                  <Progress value={32} className="h-3 bg-muted" />
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Achievements</h4>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center" title="Streak Master">
                      <Flame className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center" title="First Project">
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center" title="Quiz Ace">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Learning Journey Path */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Layout className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-display">Path Overview</h2>
                </div>
                <button className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                  View full curriculum
                </button>
              </div>

              <div className="space-y-10 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
                <PathModule
                  number={1}
                  title="Architectural Fundamentals"
                  status="completed"
                  steps={4}
                  description="Mastering the core concepts of modern web architecture and rendering patterns."
                />
                <PathModule
                  number={2}
                  title="Advanced State Management"
                  status="in-progress"
                  steps={6}
                  currentStep={2}
                  description="Diving deep into React server components, cache, and state synchronization."
                />
                <PathModule
                  number={3}
                  title="Performance & Optimization"
                  status="locked"
                  steps={5}
                  description="Learn to audit, profile and optimize large scale frontend applications."
                />
              </div>
            </div>

            {/* Right Column: Learning Mission / Resources */}
            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                    <Layers className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold font-display">Current Resources</h2>
                </div>
                <div className="p-8 rounded-[32px] border border-border bg-card shadow-inner">
                  <LearningPath />
                </div>
              </section>

              <section>
                <SuggestedCourses />
              </section>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

interface PathModuleProps {
  number: number;
  title: string;
  status: 'completed' | 'in-progress' | 'locked';
  steps: number;
  currentStep?: number;
  description: string;
}

function PathModule({ number, title, status, steps, currentStep, description }: PathModuleProps) {
  return (
    <div className="relative pl-14 group">
      {/* Node indicator */}
      <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center z-10 border transition-all duration-300 group-hover:scale-110 ${
        status === 'completed' ? 'bg-primary border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]' :
        status === 'in-progress' ? 'bg-card border-primary animate-glow py-2 shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]' :
        'bg-background border-border opacity-60'
      }`}>
        {status === 'completed' ? <Trophy className="w-5 h-5 text-primary-foreground" /> :
         status === 'in-progress' ? <Flame className="w-5 h-5 text-primary" /> :
         <BookOpen className="w-5 h-5 text-muted-foreground" />}
      </div>

      <div className={`p-8 rounded-3xl border transition-all duration-300 ${
        status === 'in-progress' ? 'bg-primary/5 border-primary/20' :
        'bg-card border-border'
      }`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Module {number}</span>
            {status === 'in-progress' && <Badge className="bg-primary text-primary-foreground border-0">ACTIVE</Badge>}
            {status === 'completed' && <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/5">DONE</Badge>}
          </div>
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {[...Array(steps)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-1.5 rounded-full ${
                      status === 'completed' ? 'bg-green-500/50' :
                      status === 'in-progress' && i < (currentStep || 0) ? 'bg-primary' :
                      'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase ml-2">
                {status === 'completed' ? `${steps}/${steps}` : status === 'in-progress' ? `${currentStep}/${steps}` : `0/${steps}`} Steps
              </span>
            </div>

            <button className={`p-2 rounded-xl transition-all ${
              status === 'locked' ? 'opacity-20 cursor-not-allowed' : 'hover:bg-muted active:scale-90'
            }`}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
