"use client";

import { useState } from "react";
import {
  UserCircle,
  Upload,
  FileText,
  Link as LinkIcon,
  Plus,
  X,
  ChevronDown,
  Sparkles,
  Mail,
  MapPin,
  Flame,
  Trophy,
  BookOpen,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const RECOGNIZED_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "Go", "Rust", "PHP", "Swift", "Kotlin",
  "React", "Vue.js", "Angular", "Next.js", "Node.js", "Express", "HTML", "CSS", "Tailwind CSS", "SASS",
  "React Native", "Flutter", "iOS Development", "Android Development",
  "SQL", "PostgreSQL", "MongoDB", "MySQL", "Redis", "GraphQL", "REST API", "Microservices",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Jenkins", "Git", "GitHub Actions",
  "Machine Learning", "Data Analysis", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Data Visualization",
  "Project Management", "Agile", "Scrum", "Leadership", "Communication", "Problem Solving", "Team Collaboration",
  "Product Management", "UX Design", "UI Design", "Marketing", "Sales", "Business Strategy",
];

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isDigesting, setIsDigesting] = useState(false);
  const [showSkillBrowser, setShowSkillBrowser] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleFileUpload = (file: File) => {
    if (file.type === "application/pdf") {
      setCvFile(file);
    }
  };

  const handleDigest = () => {
    setIsDigesting(true);
    setTimeout(() => setIsDigesting(false), 4000);
  };

  const isRecognized = (skill: string) =>
    RECOGNIZED_SKILLS.some((s) => s.toLowerCase() === skill.toLowerCase());

  return (
    <main className="h-full flex flex-col items-center p-6 bg-background text-foreground overflow-y-auto scrollbar-thin">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-3xl py-8 space-y-8">

        {/* Profile Card */}
        <div className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5" />

          {/* Avatar & Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-primary/10 border-4 border-card flex items-center justify-center shadow-lg shrink-0">
                <UserCircle className="w-12 h-12 text-primary" />
              </div>

              {/* Name & Role */}
              <div className="flex-1 pt-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-2xl font-bold h-10 bg-background/40 border-border"
                      placeholder="Your name"
                    />
                    <Input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="text-sm h-8 bg-background/40 border-border"
                      placeholder="Your role"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold font-display tracking-tight">{name || "Your Name"}</h1>
                    <p className="text-muted-foreground">{role || "Your Role"}</p>
                  </>
                )}
              </div>

              {/* Edit button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="shrink-0"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? "Done" : "Edit Profile"}
              </Button>
            </div>

            {/* Details row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-sm text-muted-foreground">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 shrink-0" />
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-sm bg-background/40 border-border" placeholder="Email" />
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-8 text-sm bg-background/40 border-border" placeholder="Location" />
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 shrink-0" />
                    <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="h-8 text-sm bg-background/40 border-border" placeholder="linkedin.com/in/username" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 shrink-0" />
                    <label htmlFor="cv-upload-inline" className="flex-1 cursor-pointer">
                      <div className="h-8 px-3 text-sm rounded-md border border-border bg-background/40 flex items-center">
                        {cvFile ? (
                          <span className="flex items-center gap-2 text-foreground">
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            {cvFile.name}
                            <button onClick={(e) => { e.preventDefault(); setCvFile(null); }} className="ml-auto hover:text-red-500">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Upload CV (PDF)</span>
                        )}
                      </div>
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); }}
                      className="hidden"
                      id="cv-upload-inline"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      <span>{email}</span>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  {linkedinUrl && (
                    <div className="flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4" />
                      <span>{linkedinUrl}</span>
                    </div>
                  )}
                  {cvFile && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>{cvFile.name}</span>
                    </div>
                  )}
                  {!email && !location && !linkedinUrl && !cvFile && (
                    <span className="text-muted-foreground/50">Click &quot;Edit Profile&quot; to add your details</span>
                  )}
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-2xl font-bold">4</span>
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">3</span>
                </div>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-2xl font-bold">12</span>
                </div>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-muted/30 border border-border rounded-3xl p-8 md:p-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Skills</h3>
              <p className="text-xs text-muted-foreground">
                Your technical and professional skills
              </p>
            </div>
          </div>

          {/* Current skills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {skills.map((skill) => (
              <button
                key={skill}
                onClick={() => removeSkill(skill)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-xl flex items-center gap-2 border transition-all hover:scale-105 hover:bg-red-500/10 hover:border-red-500/20 group/skill",
                  isRecognized(skill)
                    ? "bg-primary/10 border-primary/20"
                    : "bg-muted/50 border-border"
                )}
              >
                {skill}
                <X className="w-3 h-3 opacity-50 group-hover/skill:opacity-100 transition-opacity" />
              </button>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-muted-foreground">No skills added yet</p>
            )}
          </div>

          {/* Add skill input */}
          <div className="flex gap-2 mb-4">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Type a skill and press Enter..."
              className="h-12 bg-background/40 border-border focus:border-primary/50"
            />
            <Button
              onClick={addSkill}
              className="h-12 px-4 bg-primary hover:bg-primary-hover"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Browse recognized skills */}
          <button
            onClick={() => setShowSkillBrowser(!showSkillBrowser)}
            className="text-sm font-semibold text-primary flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            Browse recognized skills
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                showSkillBrowser && "rotate-180"
              )}
            />
          </button>
          {showSkillBrowser && (
            <div className="mt-4 p-4 rounded-2xl border border-border bg-background/40 max-h-52 overflow-y-auto scrollbar-thin animate-in fade-in duration-300">
              <div className="flex flex-wrap gap-2">
                {RECOGNIZED_SKILLS.filter((s) => !skills.includes(s))
                  .slice(0, 30)
                  .map((skill) => (
                    <button
                      key={skill}
                      onClick={() => setSkills([...skills, skill])}
                      className="px-3 py-1.5 text-xs rounded-xl border border-primary/15 bg-primary/5 transition-all hover:scale-105 hover:bg-primary/10"
                    >
                      + {skill}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary-hover shadow-xl shadow-primary/20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400"
          onClick={handleDigest}
          disabled={isDigesting}
        >
          {isDigesting ? (
            <>
              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              Analyzing Profile...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Recommendations
            </>
          )}
        </Button>

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">
            MentorAI Personalization Engine v1.0
          </p>
        </div>
      </div>
    </main>
  );
}
