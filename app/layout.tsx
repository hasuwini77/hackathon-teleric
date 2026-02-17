import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import "../styles/globals.css";

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "MentorAI - Your Personal Career Coach",
  description:
    "AI-powered mentor agent with 3D avatar that delivers personalized courses adapted to your CV, LinkedIn profile, and skills.",
};

export const viewport: Viewport = {
  themeColor: "#0a0d14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${_inter.variable} ${_spaceGrotesk.variable} min-h-screen font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
