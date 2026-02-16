"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { UserCircle, MessageSquare, GraduationCap, Bookmark } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SidebarNav() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  return (
    <nav
      className="w-16 shrink-0 flex flex-col items-center py-4 gap-2 border-r h-full"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Logo */}
      <Link href="/" className="mb-4 hover:scale-110 transition-transform">
        <Image
          src={resolvedTheme === "dark" ? "/images/skye-logo-purple.png" : "/images/skye-logo.png"}
          alt="SKYE"
          width={40}
          height={40}
          className="w-10 h-auto"
        />
      </Link>

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
