"use client";

import { User, Settings, LayoutDashboard, Bookmark, GraduationCap, ChevronLeft, Brain } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CourseSidebarProps {
  className?: string;
}

export default function CourseSidebar({ className }: CourseSidebarProps) {
  return (
    <aside
      className={cn(
        "w-20 lg:w-64 border-r flex flex-col h-full transition-all duration-300",
        className
      )}
      style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
    >
      {/* Brand Icon */}
      <div className="p-6 border-b shrink-0 flex items-center gap-3" style={{ borderColor: 'var(--color-border)' }}>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <span className="hidden lg:block font-bold tracking-tight text-foreground font-display">MentorAI</span>
      </div>

      {/* Profile Section (Compact) */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/50 border border-border">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden lg:block min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Alex Johnson</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Pro Member</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
        <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" href="/" />
        <NavItem icon={<GraduationCap className="w-5 h-5" />} label="My Courses" href="/courses" active />
        <NavItem icon={<Bookmark className="w-5 h-5" />} label="Saved" href="#" />
        <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" href="#" />
        </div>
      </nav>

      {/* Collapse Action placeholder */}
      <div className="p-4 border-t flex justify-center lg:justify-end" style={{ borderColor: 'var(--color-border)' }}>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
        active
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <div className={cn("shrink-0 transition-transform duration-200 group-hover:scale-110", active ? "text-primary" : "group-hover:text-foreground")}>
        {icon}
      </div>
      <span className="hidden lg:block text-sm font-medium">{label}</span>
      {active && <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />}
    </Link>
  );
}
