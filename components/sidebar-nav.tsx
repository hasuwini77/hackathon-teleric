"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, UserCircle, MessageSquare, GraduationCap, Bookmark } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav
      className="w-16 shrink-0 flex flex-col items-center py-4 gap-2 border-r h-full"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Logo */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
      >
        <Brain className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
      </div>

      {/* Nav items */}
      <NavIcon icon={<MessageSquare className="w-5 h-5" />} label="Chat" href="/" active={pathname === "/"} />
      <NavIcon icon={<GraduationCap className="w-5 h-5" />} label="Courses" href="/courses" active={pathname === "/courses"} />
      <NavIcon icon={<Bookmark className="w-5 h-5" />} label="Saved" href="#" active={false} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-2">
        <ThemeToggle />
        <NavIcon icon={<UserCircle className="w-5 h-5" />} label="Profile" href="/profile" active={pathname === "/profile"} />
        {/* Online indicator */}
        <div className="w-2.5 h-2.5 rounded-full animate-pulse mb-2" style={{ backgroundColor: "var(--color-primary)" }} />
      </div>
    </nav>
  );
}

function NavIcon({ icon, label, href, active = false }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      title={label}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {icon}
    </Link>
  );
}
