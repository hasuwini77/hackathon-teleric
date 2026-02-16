"use client";

import { useState } from "react";
import { User, Plus, X, ChevronLeft, Sparkles, Upload, FileText, Linkedin } from "lucide-react";

export interface UserProfile {
  skills: string[];
  experience: string;
  goals: string;
  linkedinSummary: string;
  cvFile?: File | null;
  linkedinUrl?: string;
}

interface ProfilePanelProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  onDigest: () => void;
  isDigesting: boolean;
}

// Predefined recognized skills (tech & business)
const RECOGNIZED_SKILLS = [
  // Programming Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "Go", "Rust", "PHP", "Swift", "Kotlin",
  // Web Technologies
  "React", "Vue.js", "Angular", "Next.js", "Node.js", "Express", "HTML", "CSS", "Tailwind CSS", "SASS",
  // Mobile Development
  "React Native", "Flutter", "iOS Development", "Android Development",
  // Backend & Databases
  "SQL", "PostgreSQL", "MongoDB", "MySQL", "Redis", "GraphQL", "REST API", "Microservices",
  // DevOps & Cloud
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Jenkins", "Git", "GitHub Actions",
  // Data & AI
  "Machine Learning", "Data Analysis", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Data Visualization",
  // Business & Soft Skills
  "Project Management", "Agile", "Scrum", "Leadership", "Communication", "Problem Solving", "Team Collaboration",
  "Product Management", "UX Design", "UI Design", "Marketing", "Sales", "Business Strategy"
];

export default function ProfilePanel({
  profile,
  onProfileChange,
  onDigest,
  isDigesting,
}: ProfilePanelProps) {
  const [newSkill, setNewSkill] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      onProfileChange({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    onProfileChange({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    });
  };

  const handleFileUpload = (file: File) => {
    if (file.type === "application/pdf") {
      onProfileChange({
        ...profile,
        cvFile: file,
      });
    } else {
      alert("Please upload a PDF file");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const removeCV = () => {
    onProfileChange({
      ...profile,
      cvFile: null,
    });
  };

  const isSkillRecognized = (skill: string) => {
    return RECOGNIZED_SKILLS.some(
      (recognizedSkill) => recognizedSkill.toLowerCase() === skill.toLowerCase()
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {/* CV Upload */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
            <label className="text-sm font-semibold" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)" }}>
              Upload CV
            </label>
          </div>

          {!profile.cvFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                isDragging ? "scale-105" : ""
              }`}
              style={{
                borderColor: isDragging ? "var(--color-primary)" : "var(--color-border)",
                backgroundColor: isDragging ? "rgba(var(--primary-rgb), 0.05)" : "var(--color-card)",
              }}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
                id="cv-upload"
              />
              <label htmlFor="cv-upload" className="cursor-pointer">
                <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--color-primary)" }} />
                <p className="text-sm font-medium mb-1" style={{ color: "var(--color-foreground)" }}>
                  Drop your CV here
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                  or click to browse (PDF only)
                </p>
              </label>
            </div>
          ) : (
            <div className="border rounded-xl p-4 flex items-center justify-between" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                    {profile.cvFile.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                    {(profile.cvFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeCV}
                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          )}
        </div>

        {/* LinkedIn Profile */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Linkedin className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
            <label className="text-sm font-semibold" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)" }}>
              LinkedIn Profile
            </label>
          </div>
          <input
            type="url"
            value={profile.linkedinUrl || ""}
            onChange={(e) => onProfileChange({ ...profile, linkedinUrl: e.target.value })}
            placeholder="https://linkedin.com/in/yourprofile"
            className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
              color: "var(--color-foreground)",
            }}
          />
          <p className="text-xs mt-2" style={{ color: "var(--color-muted-foreground)" }}>
            We'll extract your skills and experience
          </p>
        </div>

        {/* Skills */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
            <label className="text-sm font-semibold" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)" }}>
              Skills
            </label>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add a skill..."
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-foreground)",
              }}
            />
            <button
              onClick={addSkill}
              className="p-2.5 rounded-xl transition-all hover:scale-105"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Recognized Skills Area */}
          <div className="mb-3">
            <p className="text-xs font-medium mb-2" style={{ color: "var(--color-muted-foreground)" }}>
              Your Skills ({profile.skills.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => {
                const recognized = isSkillRecognized(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => removeSkill(skill)}
                    className="px-3 py-1.5 text-xs rounded-lg flex items-center gap-2 border transition-all hover:scale-105 cursor-pointer hover:bg-red-500/10 hover:border-red-500/20 group/skill"
                    style={{
                      backgroundColor: recognized ? "rgba(var(--primary-rgb), 0.08)" : "rgba(100, 100, 100, 0.08)",
                      borderColor: recognized ? "rgba(var(--primary-rgb), 0.2)" : "rgba(100, 100, 100, 0.2)",
                      color: "var(--color-foreground)",
                    }}
                  >
                    {skill}
                    <X className="w-3 h-3 opacity-50 group-hover/skill:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Suggested Skills */}
          <details className="group">
            <summary className="text-sm font-semibold cursor-pointer list-none flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
              <span>Browse recognized skills</span>
              <ChevronLeft className="w-4 h-4 transition-transform group-open:rotate-[-90deg]" />
            </summary>
            <div className="mt-4 p-4 rounded-xl border max-h-52 overflow-y-auto scrollbar-thin" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}>
              <div className="flex flex-wrap gap-1.5">
                {RECOGNIZED_SKILLS.filter(s => !profile.skills.includes(s)).slice(0, 30).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => {
                      onProfileChange({
                        ...profile,
                        skills: [...profile.skills, skill],
                      });
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg border transition-all hover:scale-105 cursor-pointer"
                    style={{
                      backgroundColor: "rgba(var(--primary-rgb), 0.05)",
                      borderColor: "rgba(var(--primary-rgb), 0.15)",
                      color: "var(--color-foreground)",
                    }}
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Generate Recommendations Button */}
      <div className="p-6 border-t" style={{ borderColor: "var(--color-border)" }}>
        <button
          onClick={onDigest}
          disabled={isDigesting}
          className="w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          style={{
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
            color: "var(--color-primary-foreground)",
            boxShadow: "0 4px 12px rgba(var(--primary-rgb), 0.3)",
          }}
        >
          {isDigesting ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin"/>
              Analyzing Profile...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4"/>
              Generate Recommendations
            </>
          )}
        </button>
      </div>
    </div>
  );
}
