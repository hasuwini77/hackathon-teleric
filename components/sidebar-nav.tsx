"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, UserCircle, MessageSquare, GraduationCap, Bookmark, Compass } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import ProfilePanel, { type UserProfile } from "@/components/profile-panel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function SidebarNav() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    skills: [],
    experience: "",
    goals: "",
    linkedinSummary: "",
    cvFile: null,
    linkedinUrl: "",
  });
  const [isDigesting, setIsDigesting] = useState(false);

  const handleDigest = () => {
    setIsDigesting(true);
    setTimeout(() => setIsDigesting(false), 4000);
  };

  return (
    <>
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
        <NavIcon icon={<Compass className="w-5 h-5" />} label="Intro" href="/intro" active={pathname === "/intro"} />
        <NavIcon icon={<Bookmark className="w-5 h-5" />} label="Saved" href="#" active={false} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-2">
          <ThemeToggle />
          {/* Profile button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            title="Your Profile"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <UserCircle className="w-5 h-5" />
          </button>
          {/* Online indicator */}
          <div className="w-2.5 h-2.5 rounded-full animate-pulse mb-2" style={{ backgroundColor: "var(--color-primary)" }} />
        </div>
      </nav>

      {/* Profile Sheet */}
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent side="right" className="w-[380px] sm:max-w-[380px] p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <UserCircle className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
              Your Profile
            </SheetTitle>
            <SheetDescription>
              Build your personalized learning journey
            </SheetDescription>
          </SheetHeader>
          <div className="h-[calc(100vh-120px)]">
            <ProfilePanel
              profile={profile}
              onProfileChange={setProfile}
              onDigest={handleDigest}
              isDigesting={isDigesting}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
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
